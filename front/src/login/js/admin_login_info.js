export const HandleLogin = async (id, password, admin_code) => {
  try {
    // admin_code가 존재하면 관리자 로그인, 없으면 일반 로그인
    const loginData = { id, password, admin_code };

    const response = await fetch("/api/check_admin_login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
      credentials: "include", // ✅ 쿠키 포함 (refresh 토큰 등)
    });

    const data = await response.json();
    console.log("로그인 응답 전체 데이터:", data);

    if (data.success && admin_code) {
      // ✅ 관리자 로그인 성공
      return {
        success: "admin",
        user_Data: data?.user_data ?? null,
      };
    } else {
      // ✅ 로그인 실패
      return {
        success: false,
        message: "로그인 실패",
      };
    }
  } catch (error) {
    console.error("서버 통신 오류:", error);
    return {
      success: false,
      message: "서버와의 통신 중 오류가 발생했습니다.",
    };
  }
};