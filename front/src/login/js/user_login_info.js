export const Handle_User_Login = async (user_id, password) => {
  try {
    const loginData = { user_id, password };

    const response = await fetch("/api/check_user_login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginData),
      credentials: "include",
    });

    let data;  
    try {
      data = await response.json();
    } catch {
      const text = await response.text();
      return { success: false, message: "서버 오류" };
    }

    if (data.success) {
      return {
        success: "user",
        employee_number: data?.employee_number ?? null,
        name: data?.user_name ?? null,
      };
    } else {
      return { success: false, message: "로그인 실패" };
    }
  } catch (error) {
    console.error("서버 통신 오류:", error);
    return { success: false, message: "서버와의 통신 중 오류가 발생했습니다." };
  }
};
