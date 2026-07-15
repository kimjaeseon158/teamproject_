import {
  ApiDelete,
  ApiGet,
  ApiPatch,
  ApiPost,
} from "../../../../services/api/requestJson";

export async function getAdminWorkPlaceList(toast) {
  const data = await ApiGet("/api/admin-work-place-list-create/", { toast });
  return Array.isArray(data?.work_places) ? data.work_places : [];
}

export async function createAdminWorkPlace(payload, toast) {
  return await ApiPost("/api/admin-work-place-list-create/", payload, { toast });
}

export async function updateAdminWorkPlace(payload, toast) {
  return await ApiPatch("/api/admin-work-place-update-delete/", payload, { toast });
}

export async function deleteAdminWorkPlace(adminWorkPlaceUuid, toast) {
  return await ApiDelete(
    "/api/admin-work-place-update-delete/",
    { admin_work_place_uuid: adminWorkPlaceUuid },
    { toast }
  );
}
