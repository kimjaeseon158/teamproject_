// src/calenderTest/js/submitWorkInfo.js
import { fetchWithAuth } from "../../api/fetchWithAuth";

/**
 * selectedDate가
 * 1) Date 객체
 * 2) { year, month, day }
 * 3) 문자열
 * 모두 지원해서 "YYYY-MM-DD"로 변환
 */
const toYYYYMMDD = (selectedDate) => {
  // 1) {year,month,day}
  if (
    selectedDate &&
    typeof selectedDate === "object" &&
    Number.isFinite(Number(selectedDate.year)) &&
    Number.isFinite(Number(selectedDate.month)) &&
    Number.isFinite(Number(selectedDate.day))
  ) {
    const y = String(selectedDate.year);
    const m = String(selectedDate.month).padStart(2, "0");
    const d = String(selectedDate.day).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  // 2) Date 객체
  if (selectedDate instanceof Date) {
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  // 3) fallback: 문자열/기타
  const d = new Date(selectedDate);
  if (!Number.isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  }

  return "";
};

// ✅ "YYYY-MM-DD HH:MM:SS"
const toDateTime = (yyyyMMdd, hhmm) => `${yyyyMMdd} ${hhmm}:00`;

// "HH:MM" -> minutes
const hmToMinutes = (hm) => {
  if (!hm || typeof hm !== "string" || !hm.includes(":")) return 0;
  const [h, m] = hm.split(":").map((x) => Number(x));
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
};

// ✅ start/finish로 분 계산 (같은 날 기준)
const calcMinutesFromStartFinish = (start, finish) => {
  const s = hmToMinutes(start);
  const f = hmToMinutes(finish);
  return Math.max(f - s, 0);
};

const submitWorkInfo = async (
  {
    user,
    employeeNumber,
    selectedDate,
    startTime,      // "09:30"
    finishTime,     // "18:30"
    location,

    // ✅ Option에서 만든 잔업/특근/중식 minutes
    // 예: [{work_type:"OVERTIME", minutes:120}, {work_type:"EXTRA", minutes:60}]
    details: extraDetails = [],
  },
  { toast } = {}
) => {
  const workDate = toYYYYMMDD(selectedDate);
  if (!workDate) {
    throw new Error("날짜 변환 실패: selectedDate 형태 확인 필요");
  }

  // ✅ 형식: YYYY-MM-DD HH:MM:SS
  const workStart = toDateTime(workDate, startTime);
  const workEnd = toDateTime(workDate, finishTime);

  // ✅ DAY minutes: start~finish 분 계산 후
  let rawMinutes = calcMinutesFromStartFinish(startTime, finishTime);

  // ✅ 규칙: 4시간(240분) 초과면 60분 차감
  const breakMinutes = rawMinutes > 240 ? 60 : 0;
  const dayMinutes = Math.max(rawMinutes - breakMinutes, 0);

  // ✅ 최종 details: DAY + (잔업/특근/중식 등)
  const details = [
    { work_type: "주간", minutes: dayMinutes },
    ...extraDetails.filter((d) => d?.work_type && Number(d?.minutes) > 0),
  ];

  const newRecord = {
    employee_number: String(employeeNumber),
    user_name: user?.user_name || user?.admin_id || String(user),

    work_date: workDate,
    work_start: workStart,
    work_end: workEnd,
    work_place: location,

    details,
  };

  console.log("📦 payload:", newRecord);

  // ✅ refresh 포함 fetchWithAuth 그대로
  const res = await fetchWithAuth(
    "/api/user_work_info/",
    { method: "PATCH", body: JSON.stringify(newRecord) },
    { toast }
  );

  if (!res.ok) {
    let errorMsg = "근무 정보 전송 실패";
    try {
      const errData = await res.json();
      errorMsg = errData.detail || JSON.stringify(errData);
    } catch (e) {}
    throw new Error(errorMsg);
  }

  const data = await res.json();
  return { data, newRecord };
};

export default submitWorkInfo;
