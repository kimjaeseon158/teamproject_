import { setAccessToken } from "../../api/token";

export const Handle_User_Login = async (user_id, password) => {
  try {
    const response = await fetch("/api/check_user_login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        user_id,
        password,
      }),
    });

    let data;
    try {
      data = await response.json();
    } catch {
      return { success: false, message: "서버 응답 오류" };
    }
    if (!response.ok || !data?.success) {
      return { success: false, message: "로그인 실패" };
    }
    // 🔥 핵심: access token 즉시 저장
    if (data.access) {
      setAccessToken(data.access);
    } else {
      console.error("❌ access token missing");
      return { success: false, message: "토큰 없음" };
    }

    return {
      success: true,
      role: "user",
      name: data?.user_name ?? null,
      data: data?.user_uuid ?? null,
    };
  } catch (error) {
    console.error("서버 통신 오류:", error);
    return {
      success: false,
      message: "서버와의 통신 중 오류가 발생했습니다.",
    };
  }
};
