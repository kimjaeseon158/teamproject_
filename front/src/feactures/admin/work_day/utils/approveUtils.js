export const minutesToHM = (mins) => {
  const m = Math.max(0, Number(mins) || 0);
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

export const getMinutesByType = (details = [], type) =>
  Number(details.find((d) => d.work_type === type)?.minutes) || 0;

export const toDateOnly = (v) =>
  typeof v === "string" && v.includes("T") ? v.split("T")[0] : v ?? "";

export const toTimeHM = (v) =>
  typeof v === "string" && v.includes("T") ? v.split("T")[1].slice(0, 5) : "";

export const deriveStatus = (w) =>
  w?.is_approved === true ? "승인" : w?.is_approved === false ? "거절" : "대기";

export const toYMD = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
