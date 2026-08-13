import { ApiRawDelete } from "../../../../services/api/requestJson";

export const logoutGoogle = () =>
  ApiRawDelete("/api/google/logout/", {});
