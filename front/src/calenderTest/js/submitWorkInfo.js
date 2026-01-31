import { fetchWithAuth } from "../../api/fetchWithAuth";

/* =========================
   날짜 유틸 (그대로 유지)
========================= */
const toYYYYMMDD = (selectedDate) => {
  if (
    selectedDate &&
    typeof selectedDate === "object" &&
    Number.isFinite(+selectedDate.year) &&
    Number.isFinite(+selectedDate.month) &&
    Number.isFinite(+selectedDate.day)
  ) {
    const y = String(selectedDate.year);
    const m = String(selectedDate.month).padStart(2, "0");
    const d = String(selectedDate.day).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  if (selectedDate instanceof Date) {
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  const d = new Date(selectedDate);
  if (!Number.isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  }

  return "";
};

const toDateTime = (yyyyMMdd, hhmm) => `${yyyyMMdd} ${hhmm}:00`;

const hmToMinutes = (hm) => {
  if (!hm || typeof hm !== "string" || !hm.includes(":")) return null;
  const [h, m] = hm.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
};

const calcMinutesFromStartFinish = (start, finish) => {
  const s = hmToMinutes(start);
  const f = hmToMinutes(finish);
  if (s == null || f == null) return 0;
  if (f >= s) return f - s;
  return (24 * 60 - s) + f;
};

/* =========================
   UUID 기준 근무 등록
========================= */
const submitWorkInfo = async (
  {
    user_uuid,          // 🔥 핵심 식별자
    selectedDate,
    startTime,
    finishTime,
    location,
    workType = "주간",
    details: extraDetails = [],
  },
  { toast } = {}
) => {
  if (!user_uuid) {
    throw new Error("user_uuid가 없습니다.");
  }

  const workDate = toYYYYMMDD(selectedDate);
  if (!workDate) throw new Error("날짜 변환 실패");

  const dayMinutes = calcMinutesFromStartFinish(startTime, finishTime);

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
    user_uuid,                // 🔥 UUID만 전달
    work_date: workDate,
    work_start: toDateTime(workDate, startTime),
    work_end: toDateTime(workDate, finishTime),
    work_place: location,
    details,
  };

  const res = await fetchWithAuth(
    "/api/user_work_info/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    { toast }
  );

  if (!res || !res.ok) {
    let errorMsg = "근무 정보 전송 실패";
    try {
      const errData = await res.json();
      errorMsg = errData.detail || errData.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  const data = await res.json();
  return { data, newRecord: payload };
};

export default submitWorkInfo;
