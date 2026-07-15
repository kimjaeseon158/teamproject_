import { ApiPost } from "../../../../services/api/requestJson";

export async function getWorkaddPlaceList(payload, toast) {
  return await ApiPost("/api/work-place-rate-list-create/", payload, { toast });
}
