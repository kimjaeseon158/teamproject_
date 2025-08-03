export const HandleLogin = async (id, password, dataType, admin_code) => {
    try {
        const loginData = dataType === "check_admin_login"
            ? { id, password, admin_code }
            : { id, password };

        const response = await fetch("http://127.0.0.1:8000/api/items/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                data_type: dataType,
                data: loginData
            })
        });

        const data = await response.json();

        // 응답 구조를 먼저 확인
        console.log("로그인 응답 전체 데이터:", data);

        // 메시지로 로그인 성공 판단
        if (data.message === "check_user_login 처리 완료!") {
            return {
                success: "user",
                message: data.message,
                employee_number: data?.data?.employee_number ?? null,
                name: data?.data?.user_name ?? null
            };
        } else if (data.message === "check_admin_login 처리 완료!") {
            return {
                success: "admin",
                message: data.message,
                user_Data: data?.data?.user_data ?? null
            };
        } else {
            // 로그인 실패 또는 메시지 불일치
            return {
                success: false,
                message: data?.message || "알 수 없는 오류 발생"
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