// src/admin/js/adminPageUpdate.js
import { fetchWithAuth } from "../../../../services/api/fetchWithAuth";
import { API_BASE } from "../config/api";

/**
 * 사원 정보 수정 (UUID 기준)
 * @param {Object} employeeData - 반드시 user_uuid 포함
 */
export const updateEmployee = async (employeeData, { toast } = {}) => {
  try {
    // 🔥 안전장치: UUID 필수
    if (!employeeData?.user_uuid) {
      return {
        success: false,
        error: "user_uuid가 없는 데이터입니다.",
      };
    }

    const response = await fetchWithAuth(
      `${API_BASE}/api/user_info_update/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(employeeData), // user_uuid 포함 전체 객체
      },
      { toast }
    );

    // refresh 실패 → fetchWithAuth가 null
    if (!response) {
      return {
        success: false,
        error: "인증 만료 또는 재로그인 필요",
      };
    }

    const text = await response.text();

    let result;
    try {
      result = JSON.parse(text);
    } catch (err) {
      console.error("업데이트 응답 JSON 파싱 실패");
      return {
        success: false,
        error: "서버 응답 파싱 실패",
      };
    }

    if (!response.ok || result?.success === false) {
      return {
        success: false,
        error: result?.message || "업데이트 실패",
      };
    }

    return {
      success: true,
      updated: result?.updated_user || employeeData,
    };
  } catch (error) {
    console.error("업데이트 에러");
    return { success: false, error: error.message };
  }
};
