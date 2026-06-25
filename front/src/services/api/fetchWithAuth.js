// src/api/fetchWithAuth.js
import { getAccessToken, setAccessToken, clearAccessToken } from "./token";

// ???™ì‹œ??401???¬ëŸ¬ ê°??°ì§ˆ ??refreshë¥?1ë²ˆë§Œ ?˜ë„ë¡?? ê¸ˆ
let refreshPromise = null;

export async function fetchWithAuth(url, options = {}, { toast } = {}) {
  // ???”ì²­ë§ˆë‹¤ ìµœì‹  ? í° ?½ê¸°
  const token = getAccessToken();

  const baseHeaders = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let opts = {
    credentials: "include",
    ...options,
    headers: baseHeaders,
  };

  let res = await fetch(url, opts);

  // ??401/403?´ë©´ refresh ??1ë²ˆë§Œ ?¬ì‹œ??
  if (res.status === 401 || res.status === 403) {
    try {
      // ??refreshê°€ ?´ë? ì§„í–‰ì¤‘ì´ë©?ê·¸ê±¸ ê¸°ë‹¤ë¦?
      if (!refreshPromise) {
        refreshPromise = fetch("/api/refresh-token/", {
          method: "POST",
          credentials: "include",
        })
          .then(async (refreshRes) => {
            if (!refreshRes.ok) {
              throw new Error(`refresh failed: ${refreshRes.status}`);
            }
            const refreshData = await refreshRes.json();

            const newAccess =
              refreshData.access ||
              refreshData.access_token ||
              refreshData.accessToken;

            // ??success ?¬ë? ?ê??†ì´ accessë§??ˆìœ¼ë©?OK
            if (!newAccess) throw new Error("no access token in refresh response");

            setAccessToken(newAccess);
            return newAccess;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newAccess = await refreshPromise;

      // ????? í°?¼ë¡œ Authorization êµì²´ ???¬ì‹œ??
      const retryHeaders = {
        ...baseHeaders,
        Authorization: `Bearer ${newAccess}`,
      };

      res = await fetch(url, {
        ...opts,
        headers: retryHeaders,
      });
    } catch (e) {
      console.error(e.message);
      clearAccessToken();

      // (? íƒ) ? ìŠ¤??
      if (toast) toast({ title: "?¸ì…˜??ë§Œë£Œ?˜ì—ˆ?µë‹ˆ??", status: "error" });

      // ?¬ê¸°?œëŠ” resë¥?ê·¸ë?ë¡?ë°˜í™˜ (UserContext?ì„œ 401/403 ì²˜ë¦¬)
      return res;
    }
  }

  if (!res.ok) {
    try {
    } catch (e) {
      console.warn("?‘ë‹µ ?½ê¸° ?¤íŒ¨");
    }
  }

  return res;
}
