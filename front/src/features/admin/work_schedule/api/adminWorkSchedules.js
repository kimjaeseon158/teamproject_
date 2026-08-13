import { ApiGet, ApiPatch, toQueryString } from "../../../../services/api/requestJson";

export const fetchAdminWorkSchedules = (date, { toast } = {}) =>
  ApiGet(`/api/admin-work-schedules/${toQueryString({ date })}`, { toast });

export const saveAdminWorkSchedules = (payload, { toast } = {}) =>
  ApiPatch("/api/admin-work-schedules/batch/", payload, { toast });
