import { ApiDelete, ApiPatch, toQueryString } from "../../../services/api/requestJson";

const toYYYYMMDD = (date) => {
  if (!date) return "";
  if (typeof date === "string") return date.slice(0, 10);
  if (date.year && date.month && date.day) {
    return `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
  }
  return "";
};

const toDateTime = (date, hm) => `${date} ${hm}:00`;

const buildTargetUrl = (input) => {
  const targetWorkDate = toYYYYMMDD(input.targetWorkDate ?? input.selectedDate);
  const targetWorkShift = input.targetWorkShift ?? input.workShift;

  return `/api/user-work-info/${toQueryString({
    work_date: targetWorkDate,
    work_shift: targetWorkShift,
  })}`;
};

export const buildUpdateWorkInfoPayload = ({
  details,
  finishTime,
  location,
  selectedDate,
  startTime,
  userName,
  userUuid,
  workDayId,
  workShift,
}) => {
  const workDate = toYYYYMMDD(selectedDate);

  return {
    data: {
      work_day_id: workDayId,
      user_uuid: userUuid,
      user_name: userName,
      work_shift: workShift,
      work_date: workDate,
      work_start: toDateTime(workDate, startTime),
      work_end: toDateTime(workDate, finishTime),
      work_place: location,
      details,
    },
  };
};

export const updateWorkInfo = async (input, { toast } = {}) => {
  const body = buildUpdateWorkInfoPayload(input);
  return await ApiPatch(buildTargetUrl(input), body, { toast });
};

export const deleteWorkInfo = async (input, { toast } = {}) =>
  await ApiDelete(buildTargetUrl(input), undefined, { toast });
