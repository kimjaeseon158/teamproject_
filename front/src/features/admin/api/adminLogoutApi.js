import { ApiRawDelete } from "../../../services/api/requestJson";

export const logoutAdmin = (adminUuid) =>
  ApiRawDelete("/api/admin-logout/", { admin_uuid: adminUuid });
