import { ApiGet, ApiRawGet, toQueryString } from "../../../services/api/requestJson";

const normalizeProtectedImageUrl = (imageUrl) => {
  if (!imageUrl) return imageUrl;

  try {
    const url = new URL(imageUrl, window.location.origin);
    return `${url.pathname}${url.search}`;
  } catch {
    return imageUrl;
  }
};

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
  const response = await ApiRawGet(normalizeProtectedImageUrl(imageUrl), { toast });

  if (!response.ok) {
    throw new Error("근무표 이미지 조회에 실패했습니다.");
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
};
