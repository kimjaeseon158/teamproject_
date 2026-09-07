import { useEffect, useRef, useState } from "react";
import { Box, Button, Checkbox, Flex, HStack, IconButton, Text, useToast } from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { OVERVIEW_WIDGET_LABELS } from "../constants/overviewWidgets";
import {
  COLUMNS, DEFAULT_LAYOUT, GAP, LAYOUT_STORAGE_KEY, ROW_HEIGHT,
  fitKpiHeight, loadWidgetLayout, updateWidget,
} from "../utils/widgetLayout";

const STEP = ROW_HEIGHT + GAP;

export default function OverviewWidgetLayout({ widgets, editRequest = 0 }) {
  const toast = useToast();
  const [saved, setSaved] = useState(() => {
    try { return loadWidgetLayout(window.localStorage); }
    catch { return structuredClone(DEFAULT_LAYOUT); }
  });
  const [draft, setDraft] = useState(null);
  const [gesture, setGesture] = useState(null);
  const [width, setWidth] = useState(0);
  const canvas = useRef(null);
  const drag = useRef(null);
  const handledEditRequest = useRef(0);
  const editing = draft !== null;
  const layout = fitKpiHeight(draft || saved, width || 900);
  const desktop = width >= 900;

  useEffect(() => {
    if (editRequest > handledEditRequest.current) {
      handledEditRequest.current = editRequest;
      if (!editing) setDraft(structuredClone(saved));
    }
  }, [editRequest, editing, saved]);
  const columnStep = (width + GAP) / COLUMNS;
  const visibleKeys = Object.keys(layout).filter((key) => layout[key].visible)
    .sort((a, b) => layout[a].y - layout[b].y || layout[a].x - layout[b].x);
  // The saved grid reserves a 2-row editor header for KPIs. In view mode,
  // collapse only that header half-row while keeping the 80px KPI cards visible.
  const normalEditorOffset = !editing && layout.kpis?.visible ? 1.25 : 0;
  const getRenderItem = (key) => {
    const item = layout[key];
    if (!editing && key !== "kpis" && layout.kpis?.visible) {
      return { ...item, y: Math.max(0, item.y - normalEditorOffset) };
    }
    if (!editing && key === "kpis") return { ...item, h: 1.75 };
    if (!editing && key === "employeeSnapshot") return { ...item, h: 2 };
    return item;
  };
  const height = Math.max(1, ...visibleKeys.map((key) => {
    const item = getRenderItem(key);
    return item.y + item.h;
  })) * STEP - GAP;

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(canvas.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!editing) return;
    const warn = (event) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [editing]);

  const finishGesture = (cancel = false) => {
    if (cancel && drag.current) setDraft(drag.current.layout);
    drag.current = null;
    setGesture(null);
  };

  const startGesture = (event, key, mode) => {
    if (!desktop || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.focus();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { key, mode, x: event.clientX, y: event.clientY, layout, columnStep };
    setGesture({ key, mode });
  };

  const moveGesture = (event) => {
    const active = drag.current;
    if (!active) return;
    const dx = Math.round((event.clientX - active.x) / active.columnStep);
    const dy = Math.round((event.clientY - active.y) / STEP);
    const item = active.layout[active.key];
    setDraft(updateWidget(active.layout, active.key, active.mode === "move"
      ? { x: item.x + dx, y: item.y + dy }
      : { w: item.w + dx, h: item.h + dy }, width));
  };

  const keyboardGesture = (event, key, mode) => {
    if (event.key === "Escape") { finishGesture(true); return; }
    const delta = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
    if (!delta || !desktop) return;
    event.preventDefault();
    setDraft(updateWidget(layout, key, mode === "move"
      ? { x: layout[key].x + delta[0], y: layout[key].y + delta[1] }
      : { w: layout[key].w + delta[0], h: layout[key].h + delta[1] }, width));
  };

  const controls = (key, mode) => ({
    onPointerDown: (event) => startGesture(event, key, mode),
    onPointerMove: moveGesture,
    onPointerUp: () => finishGesture(),
    onPointerCancel: () => finishGesture(true),
    onLostPointerCapture: () => { if (drag.current) finishGesture(true); },
    onKeyDown: (event) => keyboardGesture(event, key, mode),
  });

  const save = () => {
    try {
      window.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout));
      setSaved(layout);
      setDraft(null);
      toast({ title: "배치가 저장되었습니다.", status: "success", duration: 2000 });
    } catch {
      toast({ title: "배치를 저장하지 못했습니다.", description: "브라우저 저장 공간 설정을 확인해주세요. 편집 내용은 유지됩니다.", status: "error" });
    }
  };

  return (
    <Box position="relative">
      <Flex
        mb={editing ? 3 : 0}
        align="center"
        justify="space-between"
        gap={3}
        wrap="wrap"
        position={editing ? "relative" : "absolute"}
        right={editing ? undefined : 0}
        top={editing ? undefined : "-54px"}
        zIndex={3}
      >
        {!editing && <Box />}
        <HStack spacing={2}>
          {editing ? <>
            <Button size="sm" variant="outline" onClick={() => setDraft(structuredClone(DEFAULT_LAYOUT))}>기본 배치</Button>
            <Button size="sm" variant="outline" onClick={() => { finishGesture(); setDraft(null); }}>취소</Button>
            <Button size="sm" colorScheme="blue" onClick={save}>저장</Button>
          </> : null}
        </HStack>
      </Flex>

      {editing && <Box bg="white" border="1px solid" borderColor="blue.200" borderRadius="lg" p={3} mb={3}>
        <Flex gap={4} align="center" wrap="wrap">
          <Text fontSize="sm" fontWeight="bold">위젯 선택</Text>
          {Object.entries(OVERVIEW_WIDGET_LABELS).map(([key, label]) => (
            <Checkbox key={key} size="sm" isChecked={layout[key].visible}
              onChange={(event) => setDraft(updateWidget(layout, key, { visible: event.target.checked }, width))}>{label}</Checkbox>
          ))}
        </Flex>
      </Box>}

      <Box ref={canvas} position="relative" minH="120px" h={desktop ? `${height}px` : "auto"}
        display={desktop ? "block" : "flex"} flexDirection="column" gap={3}
        bg={editing ? "blue.50" : "transparent"} borderRadius="lg"
        backgroundImage={editing && desktop ? "radial-gradient(#bfd5ec 1px, transparent 1px)" : undefined}
        backgroundSize={`${columnStep}px ${STEP}px`}>
        {!visibleKeys.length && <Text p={8} textAlign="center" color="gray.500">표시할 위젯이 없습니다. 편집에서 위젯을 선택해주세요.</Text>}
        {(desktop ? Object.keys(layout).filter((key) => layout[key].visible) : visibleKeys).map((key) => {
          const item = getRenderItem(key);
          const selected = gesture?.key === key;
          return <Box key={key} role="group" aria-label={`${OVERVIEW_WIDGET_LABELS[key]} 위젯`}
            position={desktop ? "absolute" : "relative"}
            left={desktop ? `${item.x * columnStep}px` : undefined}
            top={desktop ? `${item.y * STEP}px` : undefined}
            w={desktop ? `${item.w * columnStep - GAP}px` : "100%"}
            h={desktop ? `${item.h * STEP - GAP}px` : key === "kpis" ? "auto" : `${Math.max(item.h, key === "calendar" ? 9 : 0) * STEP - GAP}px`}
            minW={0} display="flex" flexDirection="column"
            borderRadius="lg" bg={key === "kpis" ? "transparent" : editing ? "white" : undefined}
            border={editing ? "2px dashed" : "none"}
            borderColor={selected ? "blue.500" : "blue.300"}
            boxSizing="border-box"
            zIndex={selected ? 2 : 1}
            boxShadow={selected ? "lg" : undefined}>
            {editing && <Flex align="center" px={2} h="28px" flexShrink={0} bg="blue.50" borderTopRadius="lg">
              <Button {...controls(key, "move")} variant="unstyled" size="xs" display="flex" alignItems="center"
                flex="1" minW={0} justifyContent="flex-start" cursor={desktop ? (selected ? "grabbing" : "grab") : "default"}
                style={{ touchAction: "none" }} userSelect="none" isDisabled={!desktop}
                aria-label={`${OVERVIEW_WIDGET_LABELS[key]} 위치 이동`}>
                <Text as="span" mr={2} aria-hidden>⠿</Text><Text as="span" noOfLines={1}>{OVERVIEW_WIDGET_LABELS[key]}</Text>
              </Button>
              <IconButton size="xs" variant="ghost" icon={<CloseIcon boxSize={2} />}
                aria-label={`${OVERVIEW_WIDGET_LABELS[key]} 숨기기`}
                onClick={() => setDraft(updateWidget(layout, key, { visible: false }, width))} />
            </Flex>}
            <Box flex="1" minH={0} overflow="hidden" borderRadius="lg"
              inert={editing ? true : undefined}
              sx={{ "> *": { height: "100%", minHeight: 0 } }}>
              {widgets[key]}
            </Box>
            {editing && desktop && <Button {...controls(key, "resize")}
              aria-label={`${OVERVIEW_WIDGET_LABELS[key]} 크기 조절`} title={key === "kpis" ? "좌우로 너비 조절 · 높이는 자동" : "드래그 또는 방향키로 크기 조절"}
              position="absolute" bottom={0} right={0} minW="26px" w="26px" h="26px" p={0}
              variant="ghost" color="blue.600" cursor={key === "kpis" ? "ew-resize" : "nwse-resize"} style={{ touchAction: "none" }} userSelect="none"
              fontSize="lg">{key === "kpis" ? "↔" : "◢"}</Button>}
          </Box>;
        })}
      </Box>
    </Box>
  );
}
