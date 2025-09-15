// src/api/fetchWithAuth.js
export async function fetchWithAuth(url, options = {}, { toast } = {}) {
  const opts = { ...options, credentials: "include" };

  let res = await fetch(url, opts);

  if (res.status === 401) {
    // Access Token 만료 → refresh 요청
    const refreshRes = await fetch("/api/refresh_token/", {
      method: "POST",
      credentials: "include", // refresh 토큰은 쿠키에 있어야 전송됨
    });

    if (refreshRes.ok) {
      // refresh 성공 → 원래 요청 재시도
      res = await fetch(url, opts);
    } else {
      if (toast) {
        toast({
          title: "세션 만료",
          description: "다시 로그인 해주세요.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
      }
      return null;
    }
  }

  return res;
}
