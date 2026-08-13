import { refreshAccessToken } from "./authApi";
import { getAccessToken, clearAccessToken } from "./token";
import { ERROR_MESSAGES } from "../../constants/errorMessages";

let refreshPromise = null;

export async function fetchWithAuth(url, options = {}, { toast } = {}) {
  const token = getAccessToken();
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const baseHeaders = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const opts = {
    credentials: "include",
    ...options,
    headers: baseHeaders,
  };

  let res = await fetch(url, opts);

  if (res.status === 401 || res.status === 403) {
    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newAccess = await refreshPromise;
      res = await fetch(url, {
        ...opts,
        headers: {
          ...baseHeaders,
          Authorization: `Bearer ${newAccess}`,
        },
      });
    } catch (e) {
      console.error(e.message);
      clearAccessToken();

      if (toast) {
        toast({ title: ERROR_MESSAGES.common.sessionExpired, status: "error" });
      }

      return res;
    }
  }

  return res;
}
