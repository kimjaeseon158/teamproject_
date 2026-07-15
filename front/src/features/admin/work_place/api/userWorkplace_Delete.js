import { ApiDelete } from "../../../../services/api/requestJson";

export async function getWorkplaceList_Delete(payload, toast) {
  return await ApiDelete("/api/work-place-rate-update-delete/", payload, { toast });
}
