import { DEFAULT_OVERVIEW_WIDGETS, OVERVIEW_STORAGE_KEY } from "../constants/overviewWidgets";

export const LAYOUT_STORAGE_KEY = "adminOverviewGridV1";
export const COLUMNS = 12;
export const ROW_HEIGHT = 48;
export const GAP = 12;
export const WIDGET_LIMITS = {
  kpis: { minW: 6, minH: 2 },
  calendar: { minW: 5, minH: 8 },
  approvalQueue: { minW: 3, minH: 4 },
  finance: { minW: 3, minH: 6 },
  employeeSnapshot: { minW: 3, minH: 2 },
};
export const DEFAULT_LAYOUT = {
  kpis: { x: 0, y: 0, w: 12, h: 2, visible: true },
  calendar: { x: 0, y: 2, w: 7, h: 13, visible: true },
  approvalQueue: { x: 7, y: 2, w: 5, h: 4, visible: true },
  finance: { x: 7, y: 6, w: 5, h: 6, visible: true },
  employeeSnapshot: { x: 7, y: 12, w: 5, h: 2, visible: true },
};
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const integer = (value, fallback) => Number.isFinite(value) ? Math.round(value) : fallback;

export function getKpiHeight(w, canvasWidth = 900) {
  const pixelWidth = (canvasWidth + GAP) / COLUMNS * w - GAP;
  const columns = Math.max(1, Math.min(6, Math.floor((pixelWidth + GAP) / (140 + GAP))));
  const rows = Math.ceil(6 / columns);
  // Reserve the editor handle (28px); individual cards always stay 80px tall.
  return Math.ceil((rows * 88 + (rows - 1) * GAP + 28 + GAP) / (ROW_HEIGHT + GAP));
}

export function constrainWidget(key, value, canvasWidth = 900) {
  const fallback = DEFAULT_LAYOUT[key];
  const limits = WIDGET_LIMITS[key];
  const w = clamp(integer(value.w, fallback.w), limits.minW, COLUMNS);
  return {
    x: clamp(integer(value.x, fallback.x), 0, COLUMNS - w),
    y: clamp(integer(value.y, fallback.y), 0, 100),
    w,
    h: key === "kpis" ? getKpiHeight(w, canvasWidth) : clamp(integer(value.h, fallback.h), limits.minH, 24),
    visible: typeof value.visible === "boolean" ? value.visible : true,
  };
}

export const overlaps = (a, b) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

// Keep the actively edited widget in place; move colliding widgets below it.
export function resolveLayout(layout, activeKey) {
  const next = Object.fromEntries(Object.entries(layout).map(([key, item]) => [key, { ...item }]));
  const keys = Object.keys(next).filter((key) => next[key].visible)
    .sort((a, b) => next[a].y - next[b].y || next[a].x - next[b].x);
  if (activeKey && keys.includes(activeKey)) {
    keys.splice(keys.indexOf(activeKey), 1);
    keys.unshift(activeKey);
  }
  const placed = [];
  keys.forEach((key) => {
    let collisions = placed.filter((item) => overlaps(next[key], item));
    while (collisions.length) {
      next[key].y = Math.max(...collisions.map((item) => item.y + item.h));
      collisions = placed.filter((item) => overlaps(next[key], item));
    }
    placed.push(next[key]);
  });
  return next;
}

export function fitKpiHeight(layout, canvasWidth = 900) {
  const previous = layout.kpis;
  const next = constrainWidget("kpis", previous, canvasWidth);
  if (previous.h === next.h) return layout;
  const difference = next.h - previous.h;
  return resolveLayout(Object.fromEntries(Object.entries(layout).map(([key, item]) => [key,
    key === "kpis" ? next : previous.visible && item.y >= previous.y + previous.h
      ? { ...item, y: Math.max(0, item.y + difference) } : item,
  ])));
}

export function updateWidget(layout, key, changes, canvasWidth = 900) {
  const next = { ...layout[key], ...changes };
  // Resizing stops at the right edge instead of shifting the widget's origin.
  if (changes.w !== undefined && changes.x === undefined) next.w = Math.min(next.w, COLUMNS - next.x);
  if (key === "kpis") {
    const constrained = constrainWidget(key, next, canvasWidth);
    return resolveLayout(fitKpiHeight({ ...layout, kpis: { ...constrained, h: layout.kpis.h } }, canvasWidth), key);
  }
  return resolveLayout({ ...layout, [key]: constrainWidget(key, next, canvasWidth) }, key);
}

export function loadWidgetLayout(storage) {
  try {
    const saved = JSON.parse(storage.getItem(LAYOUT_STORAGE_KEY));
    const legacy = JSON.parse(storage.getItem(OVERVIEW_STORAGE_KEY));
    const layout = Object.fromEntries(Object.entries(DEFAULT_LAYOUT).map(([key, item]) => [
      key,
      constrainWidget(key, saved?.[key] && typeof saved[key] === "object"
        ? saved[key]
        : { ...item, visible: typeof legacy?.[key] === "boolean" ? legacy[key] : DEFAULT_OVERVIEW_WIDGETS[key] }),
    ]));
    // Repair heights saved by the former unrestricted vertical resize control.
    if (Number.isFinite(saved?.kpis?.h)) layout.kpis.h = clamp(Math.round(saved.kpis.h), 2, 24);
    return resolveLayout(fitKpiHeight(layout));
  } catch {
    return structuredClone(DEFAULT_LAYOUT);
  }
}
