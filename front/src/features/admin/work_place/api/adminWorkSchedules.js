import {
  ApiDelete,
  ApiGet,
  ApiRawGet,
  requestApiResponse,
  toQueryString,
} from "../../../../services/api/requestJson";

const BASE_URL = "/api/admin-work-schedules/";

const parseJsonResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || data.message || data.error || "근무표 요청에 실패했습니다.");
  }
  return data;
};

export const fetchAdminWorkSchedules = ({ toast } = {}) =>
  ApiGet(BASE_URL, { toast });

export const createAdminWorkSchedule = async ({ file, scheduleDate }, { toast } = {}) => {
  const formData = new FormData();
  formData.append("schedule_date", scheduleDate);
  formData.append("file", file);

  const response = await requestApiResponse(BASE_URL, {
    method: "POST",
    body: formData,
    toast,
  });
  return parseJsonResponse(response);
};

export const updateAdminWorkSchedule = async (
  scheduleUuid,
  { file, scheduleDate },
  { toast } = {}
) => {
  const formData = new FormData();
  if (scheduleDate) formData.append("schedule_date", scheduleDate);
  if (file) formData.append("file", file);

  const response = await requestApiResponse(`${BASE_URL}${scheduleUuid}/`, {
    method: "PATCH",
    body: formData,
    toast,
  });
  return parseJsonResponse(response);
};

export const deleteAdminWorkSchedule = (scheduleUuid, { toast } = {}) =>
  ApiDelete(`${BASE_URL}${scheduleUuid}/`, undefined, { toast });

export const downloadAdminWorkSchedule = async (scheduleUuid, { toast } = {}) => {
  const response = await ApiRawGet(`${BASE_URL}${scheduleUuid}/download/`, { toast });
  if (!response.ok) throw new Error("원본 근무표 다운로드에 실패했습니다.");
  return response;
};

export const buildAdminWorkScheduleQuery = (params) => toQueryString(params);
