import { ApiPatch } from "../../../../services/api/requestJson";

export async function updateWorkPlaceRate(payload, { toast } = {}) {
  return await ApiPatch("/api/work-place-rate-update-delete/", payload, { toast });
}
