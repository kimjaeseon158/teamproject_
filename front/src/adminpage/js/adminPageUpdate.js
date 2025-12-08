// 경로는 프로젝트 구조에 맞게 수정!
import { fetchWithAuth } from "../../api/fetchWithAuth";

export const updateEmployee = async (employee_Data, { toast } = {}) => {
  try {
    const response = await fetchWithAuth(
      "/api/user_info_update/",
      {
        method: "PATCH", // ✅ 대문자 PATCH 권장
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(employee_Data), // ✅ body 전체를 보내야 함
        // credentials: "include" 는 fetchWithAuth 안에 이미 있겠지?
      },
      { toast } // 선택
    );

    // 🔁 refresh 실패해서 null 리턴한 경우
    if (!response) {
      return { success: false, error: "인증 만료 또는 재로그인 필요" };
    }

    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      console.error("업데이트 응답 JSON 파싱 실패:", e, text);
      throw new Error("서버 응답 형식 오류");
    }

    if (!response.ok || result.success === false) {
      throw new Error(result?.error || result?.message || "업데이트 실패");
    }

    return { success: true, updated: result.updated || employee_Data };
  } catch (error) {
    console.error("업데이트 에러:", error);
    return { success: false, error: error.message };
  }
};
