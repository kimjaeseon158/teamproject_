import { ApiGet, ApiPatch } from "../../../../services/api/requestJson";

export const getPasswordResetRequests = ({ toast } = {}) =>
  ApiGet("/api/admin-password-reset-requests/", { toast });

export const approvePasswordResetRequest = (requestUuid, { toast } = {}) =>
  ApiPatch("/api/admin-password-reset-requests/", { request_uuid: requestUuid }, { toast });
