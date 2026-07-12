export const EXTRA_WORK_TYPES = [
  { value: "weekday_ot", label: "평일 야업", submitLabel: "평일 야업", aliases: ["야업"] },
  {
    value: "holiday_special",
    label: "휴일 특근",
    submitLabel: "휴일 특근",
    aliases: ["주간 특근", "야간 특근"],
  },
  { value: "holiday_ot", label: "휴일 야업", submitLabel: "휴일 야업", aliases: [] },
  {
    value: "night_ot",
    label: "야간 야업",
    submitLabel: "야간 야업",
    aliases: ["철야 야업", "철야연장"],
  },
  { value: "early_arrival", label: "조기 출근", submitLabel: "조기출근", aliases: ["조기출근"] },
  { value: "lunch_ext", label: "중식 연장", submitLabel: "중식연장", aliases: ["중식연장"] },
];

export const getExtraWorkTypeLabel = (type, fallback = "종류 선택") =>
  EXTRA_WORK_TYPES.find((item) => item.value === type)?.label || type || fallback;

export const getExtraWorkSubmitLabel = (type, fallback = "기타") =>
  EXTRA_WORK_TYPES.find((item) => item.value === type)?.submitLabel || type || fallback;

export const getExtraWorkTypeByLabel = (label) => {
  const normalizedLabel = String(label || "").trim();
  return EXTRA_WORK_TYPES.find(
    (item) =>
      item.label === normalizedLabel ||
      item.aliases?.some((alias) => alias === normalizedLabel)
  );
};
