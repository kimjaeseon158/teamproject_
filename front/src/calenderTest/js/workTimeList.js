const workTimeList = [
  /* =====================
     ✅ 주간 8시간 (휴게 포함)
     ===================== */
  { shift: "주간", startTime: "09:00", finishTime: "18:00" },
  { shift: "주간", startTime: "08:00", finishTime: "17:00" },

  /* =====================
     ✅ 주간 4시간
     ===================== */
  { shift: "주간", startTime: "08:00", finishTime: "12:00" },
  { shift: "주간", startTime: "13:00", finishTime: "17:00" },

  /* =====================
     ✅ 야간 8시간 (휴게 포함, 자정跨일)
     ===================== */
  { shift: "야간", startTime: "22:00", finishTime: "06:00" },
  { shift: "야간", startTime: "21:00", finishTime: "05:00" },

  /* =====================
     ✅ 야간 4시간
     ===================== */
  { shift: "야간", startTime: "22:00", finishTime: "02:00" },
  { shift: "야간", startTime: "23:00", finishTime: "03:00" },
];

export default workTimeList;
