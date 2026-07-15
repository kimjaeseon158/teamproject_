import { APPROVAL_STATUS } from "../constants/approvalConstants";

export const minutesToHM = (mins) => {
  const m = Math.max(0, Number(mins) || 0);
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

export const getMinutesByType = (details = [], type) =>
  details
    .filter((detail) => String(detail.work_type || "").includes(type))
    .reduce((total, detail) => total + (Number(detail.minutes) || 0), 0);

export const getTotalWorkMinutes = (details = []) =>
  details.reduce((total, detail) => total + (Number(detail.minutes) || 0), 0);

export const getWorkDurationLabel = (details = []) =>
  details
    .filter((detail) => Number(detail.minutes) > 0)
    .map((detail) => `${detail.work_type} ${minutesToHM(detail.minutes)}`)
    .join(" · ");

export const getDisplayWorkType = (workDay) => {
  const detailTypes = (workDay?.details || [])
    .map((detail) => String(detail.work_type || "").trim())
    .filter(Boolean);
  const specialType = detailTypes.find((type) => type.includes("특근"));

  return specialType || workDay?.work_shift || detailTypes[0] || "-";
};

export const toDateOnly = (value) =>
  typeof value === "string" && value.includes("T") ? value.split("T")[0] : value ?? "";

export const toTimeHM = (value) =>
  typeof value === "string" && value.includes("T") ? value.split("T")[1].slice(0, 5) : "";

export const isApprovedStatus = (status) => status === APPROVAL_STATUS.APPROVED;

export const isRejectedStatus = (status) =>
  status === APPROVAL_STATUS.REJECTED || status === "거절";

export const deriveStatus = (workDay) =>
  workDay?.is_approved === true
    ? APPROVAL_STATUS.APPROVED
    : workDay?.is_approved === false
      ? APPROVAL_STATUS.REJECTED
      : APPROVAL_STATUS.PENDING;

export const toYMD = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
