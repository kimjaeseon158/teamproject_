import { resolveApiUrl } from "../../config/api/apiEnv";
import { setAccessToken } from "./token";

const getAccessFromRefresh = (data = {}) =>
  data.access || data.access_token || data.accessToken;

export async function refreshAuthSession() {
  const res = await fetch(resolveApiUrl("/api/refresh-token/"), {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`refresh failed: ${res.status}`);
  }

  const data = await res.json();
  const access = getAccessFromRefresh(data);

  if (!access) {
    throw new Error("no access token in refresh response");
  }

  setAccessToken(access);

  return {
    ...data,
    access,
  };
}

export async function refreshAccessToken() {
  const session = await refreshAuthSession();
  return session.access;
}
