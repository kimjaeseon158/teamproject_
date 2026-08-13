export const EMPTY_PLACE = "미지정";

export const RATE_FIELDS = [
  { key: "base_hourly_wage", label: "주간" },
  { key: "overtime_hourly_wage", label: "평일 잔업" },
  { key: "meal_ot_hourly_wage", label: "중식연장" },
  { key: "special_hourly_wage", label: "특근" },
  { key: "day_special_hourly_wage", label: "주간 특근" },
  { key: "night_special_hourly_wage", label: "야간 특근" },
  { key: "overnight_hourly_wage", label: "야간" },
  { key: "overnight_ot_hourly_wage", label: "야간 잔업" },
  { key: "early_hourly_wage", label: "조기출근" },
];

export const initialRateForm = RATE_FIELDS.reduce(
  (form, field) => ({
    ...form,
    [field.key]: "",
  }),
  {
    admin_work_place_uuid: "",
    work_place: "",
  }
);
