export const HandleLogin = async (id, password, dataType, admin_code) => {
    try {
        const loginData = dataType === "check_admin_login"
            ? { id, password, admin_code }
            : { id, password };

        const response = await fetch("http://127.0.0.1:8000/api/login/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                data_type: dataType,
                data: loginData
            }),
            credentials: "include" // ✅ HttpOnly 쿠키 사용 시 필요
        });

        const data = await response.json();
        console.log("로그인 응답 전체 데이터:", data);

        // HttpOnly 쿠키 기반이므로 access/refresh 토큰은 프론트에서 직접 다루지 않음
        if (data.success && dataType === "check_user_login") {
            return {
                success: "user",
                employee_number: data?.data?.employee_number ?? null,
                name: data?.data?.user_name ?? null
            };
        } else if (data.success && dataType === "check_admin_login") {
            return {
                success: "admin",
                user_Data: data?.data?.user_data ?? null
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
