export async function total_payPost(payload, toast) {
  try {
    let res = await fetch("/api/finance_total/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    // Access Token 만료 → 401 Unauthorized
    if (res.status === 401) {
      const refreshRes = await fetch("/api/refresh_token/", {
        method: "POST",
        credentials: "include", // Refresh Token 자동 전송
      });

      if (refreshRes.ok) {
        // 새 Access Token 발급 성공 → 원래 요청 재시도
        res = await fetch("/api/finance_total/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
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

    const data = await res.json();
    return data;
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
    return null;
  }
}
