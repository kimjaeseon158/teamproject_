import { ApiPatch } from "../../../../services/api/requestJson";

export async function getWorkPlaceList_Update(payload, { toast } = {}) {
  return await ApiPatch("/api/work-place-rate-update-delete/", payload, { toast });
}
