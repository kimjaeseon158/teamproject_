export const WORK_TYPE_RATE_FIELD = {
  주간: "base_hourly_wage",
  "평일 잔업": "overtime_hourly_wage",
  중식연장: "meal_ot_hourly_wage",
  "주간 특근": "day_special_hourly_wage",
  "야간 특근": "night_special_hourly_wage",
  야간: "overnight_hourly_wage",
  "야간 잔업": "overnight_ot_hourly_wage",
  조기출근: "early_hourly_wage",
};

export const EXTRA_WORK_TYPES = [
  { value: "weekday_ot", label: "평일 잔업", submitLabel: "평일 잔업", aliases: ["잔업", "연장", "평일 연장"] },
  {
    value: "holiday_special",
    label: "특근",
    submitLabel: "특근",
    aliases: ["주간 특근", "야간 특근", "휴일 특근"],
  },
  { value: "night_ot", label: "야간 잔업", submitLabel: "야간 잔업", aliases: ["야간 연장", "철야 연장", "철야연장"] },
  { value: "early_arrival", label: "조기출근", submitLabel: "조기출근", aliases: ["조기 출근"] },
  { value: "lunch_ext", label: "중식연장", submitLabel: "중식연장", aliases: ["중식 연장"] },
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
      item.submitLabel === normalizedLabel ||
      item.aliases?.some((alias) => alias === normalizedLabel)
  );
};
