// src/api/fetchWithAuth.js
import { getAccessToken, setAccessToken, clearAccessToken } from "./token";

export async function fetchWithAuth(url, options = {}, { toast } = {}) {
  const token = getAccessToken();
  console.log("🔐 현재 access token:", token);

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

  console.log("📨 요청 URL:", url);
  console.log("📨 요청 headers:", opts.headers);

  let res = await fetch(url, opts);
  console.log("📨 첫 응답 status:", res.status);

  if (res.status === 401 || res.status === 403) {
    console.warn("⚠️ 토큰 만료/권한 오류, refresh 시도");

    try {
      const refreshRes = await fetch("/api/refresh_token/", {
        method: "POST",
        credentials: "include",
      });

      console.log("🔄 refresh 응답 status:", refreshRes.status);

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        console.log("🔄 refresh 응답 JSON:", refreshData);

        // 🔥 응답 키 이름 맞춰서 새 access 꺼내기
        const newAccess =
          refreshData.access ||
          refreshData.access_token ||
          refreshData.accessToken;

        if (refreshData.success && newAccess) {
          // ✅ 새 access 저장
          setAccessToken(newAccess);

          // ✅ 새 access로 Authorization 교체
          const retryHeaders = {
            ...baseHeaders,
            Authorization: `Bearer ${newAccess}`,
          };

          opts = {
            ...opts,
            headers: retryHeaders,
          };

          console.log("🔁 재요청 headers:", opts.headers);

          // 🔁 원래 요청 재시도
          res = await fetch(url, opts);
          console.log("🔁 재요청 응답 status:", res.status);
        } else {
          console.error("❌ refresh 응답에 access 토큰 없음");
          clearAccessToken();
        }
      } else {
        console.error("❌ refresh 실패, status:", refreshRes.status);
        clearAccessToken();
      }
    } catch (e) {
      console.error("refresh 요청 오류:", e);
      clearAccessToken();
    }
  }

  if (!res.ok) {
    try {
      const clone = res.clone();
      const text = await clone.text();
      console.warn("❌ 응답 body:", text);
    } catch (e) {
      console.warn("❌ 응답 body 읽기 실패:", e);
    }
  }

  return res;
}
