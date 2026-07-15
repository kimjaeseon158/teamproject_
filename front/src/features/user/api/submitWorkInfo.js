import { ApiPost } from "../../../services/api/requestJson";

/* =========================
   날짜 유틸
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
   UUID 기반 근무 등록
========================= */
export const buildWorkInfoPayload = (input) => {
  if (Array.isArray(input)) {
    return {
      data: input.map(item => {
        const workDate = toYYYYMMDD(item.work_date);
        if (!workDate) throw new Error("날짜 변환 실패");

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

  if (!user_uuid) throw new Error("user_uuid가 없습니다.");

  const workDate = toYYYYMMDD(work_date ?? selectedDate);
  if (!workDate) throw new Error("날짜 변환 실패");

  return {
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
};

const submitWorkInfo = async (input, { toast } = {}) => {
  const body = buildWorkInfoPayload(input);
  return await ApiPost("/api/user-work-info/", body, { toast });
};

export default submitWorkInfo;
