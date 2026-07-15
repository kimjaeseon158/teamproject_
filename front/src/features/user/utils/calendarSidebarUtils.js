export const getDaysInMonth = (year, month) => {
  const date = new Date(year, month - 1, 1);
  const days = [];

  while (date.getMonth() === month - 1) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }

  return days;
};

export const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

export const formatWon = (value) => {
  if (value == null || Number.isNaN(Number(value))) return "-";
  return `${Number(value).toLocaleString()}원`;
};

export const isOvertimeType = (workType) =>
  String(workType || "").includes("잔업") || String(workType || "").includes("연장");

export const getWorkType = (item = {}) =>
  item.details?.[0]?.work_type ||
  item.detail_amounts?.[0]?.work_type ||
  item.work_type ||
  item.work_shift ||
  "근무";

export const getOvertimeAmount = (item = {}) => {
  const detailAmount = (item.detail_amounts || [])
    .filter((detail) => isOvertimeType(detail.work_type))
    .reduce((sum, detail) => sum + (Number(detail.amount) || 0), 0);

  if (detailAmount > 0) return detailAmount;

  return Object.entries(item.amount_breakdown || {})
    .filter(([key]) => isOvertimeType(key))
    .reduce((sum, [, value]) => sum + (Number(value) || 0), 0);
};

export const getBaseAmount = (item = {}) => {
  const workType = getWorkType(item);
  const baseDetail =
    (item.detail_amounts || []).find((detail) => detail.work_type === workType) ||
    (item.detail_amounts || []).find(
      (detail) => !isOvertimeType(detail.work_type)
    );

  return (
    baseDetail?.amount ??
    item.amount_breakdown?.[workType] ??
    item.amount_breakdown?.[item.work_shift] ??
    0
  );
};

export const getApprovalStatus = (isApproved) => {
  if (isApproved === true) {
    return { text: "승인 완료", color: "green" };
  }

  if (isApproved === false) {
    return { text: "반려됨", color: "red" };
  }

  return { text: "승인 대기중", color: "orange" };
};
