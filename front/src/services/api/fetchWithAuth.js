import { refreshAccessToken } from "./authApi";
import { getAccessToken, clearAccessToken } from "./token";

// 동시에 401/403 에러가 여러 번 발생해도 refresh는 1번만 시도하도록 잠금
let refreshPromise = null;

export async function fetchWithAuth(url, options = {}, { toast } = {}) {
  // 요청마다 최신 토큰 읽기
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

  // 401/403이면 refresh 후 1번만 재시도
  if (res.status === 401 || res.status === 403) {
    try {
      // refresh가 이미 진행 중이면 그 요청을 기다립니다.
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newAccess = await refreshPromise;

      // 새 토큰으로 Authorization을 교체해 재시도합니다.
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

      if (toast) toast({ title: "세션이 만료되었습니다.", status: "error" });

      // 여기서는 res를 그대로 반환하고 UserContext에서 401/403을 처리합니다.
      return res;
    }
  }

  if (!res.ok) {
    try {
    } catch (e) {
      console.warn("응답 읽기 실패");
    }
  }

  return res;
}
