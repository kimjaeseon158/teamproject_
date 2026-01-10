// 경로는 프로젝트 구조에 맞게 수정!
import { fetchWithAuth } from "../../api/fetchWithAuth";

export const deleteEmployees = async (employee_Numbers, { toast } = {}) => {
  try {
    const results = [];      // 각 사원의 삭제 결과 저장
    const deleted_Users = []; // 삭제된 유저 데이터 저장
    const failed = [];       // 실패한 요청들 저장

    for (const empNo of employee_Numbers) {
      const body = {
        employee_number: empNo, // 서버에서 요구하는 구조
      };


      // ✅ fetch → fetchWithAuth 로 변경
      const response = await fetchWithAuth(
        "/api/user_info_delete/",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
          // credentials: "include"  // 보통 fetchWithAuth 안에서 이미 넣어줌
        },
        { toast } // 옵션: 토스트 쓰고 있으면 그대로 넘겨주기
      );

      // 🔁 refresh 실패해서 fetchWithAuth가 null 리턴했다면
      if (!response) {
        failed.push({
          employee_number: empNo,
          error: "인증 만료 또는 재로그인 필요",
        });
        // 보통 이 경우엔 RequireAuth에서 로그인페이지로 튕겼을 확률이 높음
        continue;
      }

      const text = await response.text();

      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        console.error(`응답이 JSON이 아닙니다.`, e);
        failed.push({
          employee_number: empNo,
          error: "응답 JSON 파싱 실패",
        });
        continue;
      }

      const success = parsed?.success;
      const userData = parsed?.user_data || [];

      if (success) {
        deleted_Users.push(...userData); // 여러 명 삭제되었을 수도 있음
        results.push({ employee_number: empNo, success: true });
      } else {
        failed.push({
          employee_number: empNo,
          success: false,
          message: parsed?.data?.message || "알 수 없는 실패",
        });
        results.push({ employee_number: empNo, success: false });
      }
    }

    if (failed.length > 0) {
      return {
        success: false,
        failedItems: failed,
        deleted_Users,
        allResults: results,
      };
    }
    return {
      success: true,
      deleted_Users,
      allResults: results,
    };
  } catch (err) {
    console.error("삭제 중 예외 발생:", err);
    return { success: false, error: err.message };
  }
};
