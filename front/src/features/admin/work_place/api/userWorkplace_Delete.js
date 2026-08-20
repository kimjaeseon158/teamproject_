import { ApiDelete } from "../../../../services/api/requestJson";

export async function deleteWorkPlaceRate(payload, toast) {
  return await ApiDelete("/api/work-place-rate-update-delete/", payload, { toast });
}
