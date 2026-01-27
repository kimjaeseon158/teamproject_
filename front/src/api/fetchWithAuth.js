// src/api/fetchWithAuth.js
import { getAccessToken, setAccessToken, clearAccessToken } from "./token";

// ✅ 동시에 401이 여러 개 터질 때 refresh를 1번만 하도록 잠금
let refreshPromise = null;

export async function fetchWithAuth(url, options = {}, { toast } = {}) {
  // ✅ 요청마다 최신 토큰 읽기
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

  // ✅ 401/403이면 refresh 후 1번만 재시도
  if (res.status === 401 || res.status === 403) {
    try {
      // ✅ refresh가 이미 진행중이면 그걸 기다림
      if (!refreshPromise) {
        refreshPromise = fetch("/api/refresh_token/", {
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

            // ✅ success 여부 상관없이 access만 있으면 OK
            if (!newAccess) throw new Error("no access token in refresh response");

            setAccessToken(newAccess);
            return newAccess;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newAccess = await refreshPromise;

      // ✅ 새 토큰으로 Authorization 교체 후 재시도
      const retryHeaders = {
        ...baseHeaders,
        Authorization: `Bearer ${newAccess}`,
      };

      res = await fetch(url, {
        ...opts,
        headers: retryHeaders,
      });
    } catch (e) {
      console.error("refresh 요청 오류:", e);
      clearAccessToken();

      // (선택) 토스트
      if (toast) toast({ title: "세션이 만료되었습니다.", status: "error" });

      // 여기서는 res를 그대로 반환 (UserContext에서 401/403 처리)
      return res;
    }
  }

  if (!res.ok) {
    try {
      const clone = res.clone();
    } catch (e) {
      console.warn("❌ 응답 body 읽기 실패:", e);
    }
  }

  return res;
}
