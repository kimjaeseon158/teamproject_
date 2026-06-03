export const userPlace_listColmns = [
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
    key: "day_special_hourly_wage",
    label: "주간 특근(평균)",
    render: (value) => value ?? "-"
  },
  {
    key: "night_special_hourly_wage",
    label: "야간 특근(평균)",
    render: (value) => value ?? "-"
  },
];
