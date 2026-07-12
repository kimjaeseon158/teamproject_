import { ApiPatch } from "../../../../services/api/requestJson";

export async function adminWorkdayStatusUpdate(payload, { toast } = {}) {
  return await ApiPatch("/api/admin-workday-status-update/", payload, { toast });
}
