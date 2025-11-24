/**
 * 401이면 /api/refresh_token/ 호출 후 원요청을 재시도하는 래퍼
 * - 백엔드가 HttpOnly 쿠키(Access/Refresh)를 쓰는 구조를 가정
 */
export async function fetchWithAuth(url, options = {}, { toast } = {}) {
  const opts = {
    credentials: "include", // ✅ 쿠키 포함 (Access/Refresh 전부)
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  };

  try {
    let res = await fetch(url, opts);

    // 🔐 Access 만료 가정 → Refresh 시도
    if (res.status === 401) {
      console.log("[fetchWithAuth] 401 감지 → /api/refresh_token/ 호출");

      const refresh = await fetch("/api/refresh_token/", {
        method: "POST",
        credentials: "include", // ✅ 여기서 Refresh 토큰(HttpOnly 쿠키) 사용
      });

      if (refresh.ok) {
        console.log("[fetchWithAuth] refresh 성공 → 원 요청 재시도");
        // 🔁 재발급 성공 → 원 요청 재시도 (이때 새 Access 쿠키가 이미 세팅된 상태)
        res = await fetch(url, opts);
      } else {
        console.log(
          "[fetchWithAuth] refresh 실패 → 상태 코드:",
          refresh.status
        );
        if (toast) {
          toast({
            title: "세션 만료",
            description: "다시 로그인 해 주세요.",
            status: "warning",
            duration: 3000,
            isClosable: true,
          });
        }
        // refresh도 실패했으면 그대로 401 응답 돌려보냄
        return res;
      }
    }

    return res;
  } catch (err) {
    console.error("[fetchWithAuth] 네트워크 오류:", err);
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
