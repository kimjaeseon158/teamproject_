/* =================================
   finance / expense / company 공용
================================= */

const pad = (n) => String(n).padStart(2, "0");

/* =========================
   화면 표시용
========================= */

// YYYY.MM.DD
export const formatDotDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
};

// YYYY.MM.DD ~ YYYY.MM.DD
export const formatRangeLabel = (from, to) => {
  if (!from || !to) return "";
  return `${formatDotDate(from)} ~ ${formatDotDate(to)}`;
};

/* =========================
   API 전달용
========================= */

// YYYY-MM-DD
export const toISODate = (date) => {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
};

/* =========================
   안전 변환
========================= */

export const toDate = (value) => {
  if (!value) return null;
  return value instanceof Date ? value : new Date(value);
};
