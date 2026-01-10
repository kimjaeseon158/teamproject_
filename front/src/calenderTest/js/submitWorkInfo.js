import { fetchWithAuth } from "../../api/fetchWithAuth";

/**
 * selectedDate →
 * 1) Date
 * 2) { year, month, day }
 * 3) string
 * 모두 "YYYY-MM-DD"로 변환
 */
const toYYYYMMDD = (selectedDate) => {
  // {year,month,day}
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

  // Date 객체
  if (selectedDate instanceof Date) {
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  // 문자열
  const d = new Date(selectedDate);
  if (!Number.isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  }

  return "";
};

// "YYYY-MM-DD HH:MM:SS"
const toDateTime = (yyyyMMdd, hhmm) => `${yyyyMMdd} ${hhmm}:00`;

// "HH:MM" → minutes
const hmToMinutes = (hm) => {
  if (!hm || typeof hm !== "string" || !hm.includes(":")) return null;
  const [h, m] = hm.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
};

/**
 * ✅ start ~ finish 분 계산
 * - 야간(자정跨일) 처리 포함
 */
const calcMinutesFromStartFinish = (start, finish) => {
  const s = hmToMinutes(start);
  const f = hmToMinutes(finish);
  if (s == null || f == null) return 0;

  // 같은 날
  if (f >= s) return f - s;

  // 자정 넘어감 (야간)
  return (24 * 60 - s) + f;
};

const submitWorkInfo = async (
  {
    user,
    employeeNumber,
    selectedDate,
    startTime,
    finishTime,
    location,

    // "주간" | "야간" | "주간-특근" | "야간-특근"
    workType = "주간",

    // [{ work_type:"잔업", minutes:120 }, { work_type:"중식", minutes:60 }]
    details: extraDetails = [],
  },
  { toast } = {}
) => {
  const workDate = toYYYYMMDD(selectedDate);
  if (!workDate) throw new Error("날짜 변환 실패");

  const workStart = toDateTime(workDate, startTime);
  const workEnd = toDateTime(workDate, finishTime);

  // ✅ 휴게시간 포함된 리스트 기준 → 그대로 분 계산
  const dayMinutes = calcMinutesFromStartFinish(startTime, finishTime);

  /**
   * ✅ 최종 details
   * - 메인 근무(주간/야간/특근)
   * - 잔업 / 중식은 Option에서 계산된 값만 추가
   */
  const details = [
    {
      work_type: workType,
      minutes: dayMinutes,
    },
    ...extraDetails.filter(
      (d) => d?.work_type && Number.isFinite(d.minutes) && d.minutes > 0
    ),
  ];

  const payload = {
    employee_number: String(employeeNumber),
    user_name: user?.user_name || user?.admin_id || String(user),

    work_date: workDate,
    work_start: workStart,
    work_end: workEnd,
    work_place: location,

    details,
  };


  const res = await fetchWithAuth(
    "/api/user_work_info/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
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
  return { data, newRecord: payload };
};

export default submitWorkInfo;
