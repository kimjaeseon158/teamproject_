// 예: src/login/js/loginAPI.js
import { setAccessToken } from "../../api/token";

export const HandleLogin = async (id, password, admin_code) => {
  try {
    const loginData = { id, password, admin_code };

    const response = await fetch("/api/check_admin_login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
      credentials: "include", // ✅ refresh 토큰 쿠키
    });

    const data = await response.json();
    if (data.success && admin_code) {
      // 🔥 access 토큰이 응답에 있다고 가정 (data.access)
      if (data.access) {
        setAccessToken(data.access);   // ✅ 전역 메모리에 저장
      }

      return {
        success: "admin",
        user_Data: data?.admin_uuid ?? null,
      };
    } else {
      return {
        success: false,
        message: data?.message || "로그인 실패",
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
