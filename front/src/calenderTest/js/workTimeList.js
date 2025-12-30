// src/constants/workTimeList.js
const workTimeList = [
  // ✅ 주간(day)
  { shift: "day", startTime: "08:00", finishTime: "17:00" },
  { shift: "day", startTime: "08:30", finishTime: "17:30" },
  { shift: "day", startTime: "09:00", finishTime: "18:00" },
  { shift: "day", startTime: "09:30", finishTime: "18:30" },

  // ✅ 주간 반일(오전)
  { shift: "day", startTime: "08:00", finishTime: "12:00" },
  { shift: "day", startTime: "08:30", finishTime: "12:30" },
  { shift: "day", startTime: "09:00", finishTime: "13:00" },
  { shift: "day", startTime: "09:30", finishTime: "13:30" },

  // ✅ 주간 반일(오후)
  { shift: "day", startTime: "13:00", finishTime: "17:00" },
  { shift: "day", startTime: "13:30", finishTime: "17:30" },

  // ✅ 야간(night) — 필요에 맞게 수정 가능
  { shift: "night", startTime: "18:00", finishTime: "03:00" },
  { shift: "night", startTime: "19:00", finishTime: "04:00" },
  { shift: "night", startTime: "20:00", finishTime: "05:00" },
  { shift: "night", startTime: "21:00", finishTime: "06:00" },

  // ✅ 야간 반일(예시)
  { shift: "night", startTime: "18:00", finishTime: "23:00" },
  { shift: "night", startTime: "22:00", finishTime: "03:00" },
];

export default workTimeList;
