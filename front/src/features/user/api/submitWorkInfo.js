import { fetchWithAuth } from "../../../services/api/fetchWithAuth";

/* =========================
   ? ì§œ ? í‹¸
========================= */
const toYYYYMMDD = (d) => {
  if (d && typeof d === "object" && d.year && d.month && d.day) {
    return `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
  }
  const date = new Date(d);
  if (!Number.isNaN(date.getTime())) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }
  return "";
};

const toDateTime = (date, hm) => `${date} ${hm}:00`;

/* =========================
   UUID ê¸°ì? ê·¼ë¬´ ?±ë¡
========================= */
const submitWorkInfo = async (input, { toast } = {}) => {
  let body;

  // ??bulk
  if (Array.isArray(input)) {
    body = {
      data: input.map(item => {
        const workDate = toYYYYMMDD(item.work_date);
        if (!workDate) throw new Error("? ì§œ ë³€???¤íŒ¨");

        return {
          user_uuid: item.user_uuid,
          user_name: item.user_name,
          work_shift: item.work_shift,
          work_date: workDate,
          work_start: toDateTime(workDate, item.startTime),
          work_end: toDateTime(workDate, item.finishTime),
          work_place: item.location,
          details: item.details,
        };
      }),
    };
  }
  // ??single
  else {
    const {
      user_uuid,
      user_name,
      work_shift,
      selectedDate,
      work_date,
      startTime,
      finishTime,
      location,
      details = [],
    } = input;

    if (!user_uuid) throw new Error("user_uuidê°€ ?†ìŠµ?ˆë‹¤.");

    const workDate = toYYYYMMDD(work_date ?? selectedDate);
    if (!workDate) throw new Error("? ì§œ ë³€???¤íŒ¨");

    body = {
      data: {
        user_uuid,
        user_name,
        work_shift,
        work_date: workDate,
        work_start: toDateTime(workDate, startTime),
        work_end: toDateTime(workDate, finishTime),
        work_place: location,
        details,
      },
    };
  }

  const res = await fetchWithAuth(
    "/api/user-work-info/",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    { toast }
  );

  if (!res || !res.ok) {
    let msg = "ê·¼ë¬´ ?•ë³´ ?„ì†¡ ?¤íŒ¨";
    try {
      const err = await res.json();
      msg = err.detail || err.message || msg;
    } catch {}
    throw new Error(msg);
  }

  // ???¬ê¸°ë§??˜ì •
  try {
    return await res.json();
  } catch {
    return null;
  }
};

export default submitWorkInfo;
