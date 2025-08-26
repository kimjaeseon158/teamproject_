export const HandleLogin = async (id, password, admin_code) => {
  try {
    // admin_code가 존재하면 관리자 로그인, 없으면 일반 로그인
    const loginData = admin_code
      ? { id, password, admin_code }  
      : { id, password };   
    console.log(loginData)        

    const response = await fetch("/api/check_admin_login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData), 
      credentials: "include"           
    });

    const data = await response.json();
    console.log("로그인 응답 전체 데이터:", data);

    if (data.success && admin_code) {
      return {
        success: "admin",
        user_Data: data?.user_data ?? null
      };
    } else if (data.success) {
      return {
        success: "user",
        employee_number: data?.employee_number ?? null,
        name: data?.user_name ?? null
      };
    } else {
      return {
        success: false,
        message: "로그인 실패"
      };
    }
  } catch (error) {
    console.error("서버 통신 오류:", error);
    return {
      success: false,
      message: "서버와의 통신 중 오류가 발생했습니다."
    };
  }
};
