import { ApiGet, ApiRawGet, toQueryString } from "../../../services/api/requestJson";

export const fetchUserWorkSchedule = (date, { toast } = {}) =>
  ApiGet(`/api/user-work-schedule/${toQueryString({ date })}`, { toast });

export const fetchUserWorkSchedulePageImage = async (
  scheduleUuid,
  pageNumber,
  { toast } = {}
) => {
  const response = await ApiRawGet(
    `/api/user-work-schedules/${scheduleUuid}/pages/${pageNumber}/`,
    { toast }
  );

  if (!response.ok) {
    throw new Error("근무표 이미지 조회에 실패했습니다.");
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const fetchUserWorkScheduleImageUrl = async (imageUrl, { toast } = {}) => {
  const response = await ApiRawGet(imageUrl, { toast });

  if (!response.ok) {
    throw new Error("근무표 이미지 조회에 실패했습니다.");
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
};
