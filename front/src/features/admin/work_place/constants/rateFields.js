export const EMPTY_PLACE = "미지정";

export const RATE_FIELDS = [
  { key: "base_hourly_wage", label: "기본시급" },
  { key: "overtime_hourly_wage", label: "연장시급" },
  { key: "meal_ot_hourly_wage", label: "식대연장" },
  { key: "special_hourly_wage", label: "특근" },
  { key: "day_special_hourly_wage", label: "주간 특근" },
  { key: "night_special_hourly_wage", label: "야간 특근" },
  { key: "overnight_hourly_wage", label: "철야" },
  { key: "overnight_ot_hourly_wage", label: "철야연장" },
  { key: "early_hourly_wage", label: "조기 출근" },
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
