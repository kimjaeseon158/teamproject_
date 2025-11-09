/**
 * 401이면 /api/refresh_token/ 호출 후 원요청을 재시도하는 래퍼
 * - 백엔드가 HttpOnly 쿠키(Access/Refresh)를 쓰는 구조를 가정
 */
export async function fetchWithAuth(url, options = {}, { toast } = {}) {
  const opts = {
    credentials: "include", // 쿠키 포함
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  };

  try {
    let res = await fetch(url, opts);

    // Access 만료 시도 가정 → Refresh
    if (res.status === 401) {
      const refresh = await fetch("/api/refresh_token/", {
        method: "POST",
        credentials: "include",
      });

      if (refresh.ok) {
        // 재발급 성공 → 원 요청 재시도
        res = await fetch(url, opts);
      }
    }

    return res;
  } catch (err) {
    if (toast) {
      toast({
        title: "네트워크 오류",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    throw err;
  }
}
