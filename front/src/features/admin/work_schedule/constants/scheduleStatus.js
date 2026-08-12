export const SCHEDULE_STATUSES = [
  { value: "DAY", label: "주간", colorScheme: "green", requiresPlace: true },
  { value: "NIGHT", label: "야간", colorScheme: "blue", requiresPlace: true },
  { value: "OFF", label: "휴무", colorScheme: "gray", requiresPlace: false },
  { value: "TRAINING", label: "교육", colorScheme: "orange", requiresPlace: false, requiresDetail: true },
];

export const getScheduleStatus = (status) =>
  SCHEDULE_STATUSES.find((item) => item.value === status) || SCHEDULE_STATUSES[0];
