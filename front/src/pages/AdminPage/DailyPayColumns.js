export const userPlaceListColumns = [
  {
    key: "user_name",
    label: "이름",
  },
  {
    key: "work_place",
    label: "작업장",
  },
  {
    key: "base_hourly_wage",
    label: "기본일급(평균)",
    render: (value) => value ?? "-"
  },
  {
    key: "overtime_hourly_wage",
    label: "연장일급(평균)",
    render: (value) => value ?? "-"
  },
  {
    key: "meal_ot_hourly_wage",
    label: "식대연장(평균)",
    render: (value) => value ?? "-"
  },
  {
    key: "day_special_hourly_wage",
    label: "주간 특근(평균)",
    render: (value) => value ?? "-"
  },
  {
    key: "night_special_hourly_wage",
    label: "야간 특근(평균)",
    render: (value) => value ?? "-"
  },
  {
    key: "overnight_hourly_wage",
    label: "철야(평균)",
    render: (value) => value ?? "-"
  },
  {
    key: "overnight_ot_hourly_wage",
    label: "야간연장(평균)",
    render: (value) => value ?? "-"
  },
  {
    key: "early_hourly_wage",
    label: "조기 출근(평균)",
    render: (value) => value ?? "-"
  },
];
