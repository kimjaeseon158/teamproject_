import { ApiDelete } from "../../../services/api/requestJson";

export const logoutUser = (userUuid, { toast } = {}) =>
  ApiDelete("/api/user-logout/", { user_uuid: userUuid }, { toast });
