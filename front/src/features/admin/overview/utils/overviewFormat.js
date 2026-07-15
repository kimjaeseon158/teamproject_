export const formatMonth = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

export const formatWon = (value) => `${Number(value || 0).toLocaleString()}원`;

export const formatNumber = (value) => Number(value || 0).toLocaleString();

export const average = (values) => {
  const valid = values.filter((value) => value != null && value !== "");
  if (!valid.length) return 0;
  return Math.round(valid.reduce((sum, value) => sum + Number(value), 0) / valid.length);
};
