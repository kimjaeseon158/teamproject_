// src/admin/js/adminPageDelete.js
import { fetchWithAuth } from "../../../../services/api/fetchWithAuth";

/**
 * 사원 삭제 (UUID 기준)
 * @param {string[]} userUuids - 삭제할 user_uuid 배열
 */
export const deleteEmployees = async (userUuids, { toast } = {}) => {
  try {
    if (!Array.isArray(userUuids) || userUuids.length === 0) {
      return { success: false, error: "삭제할 대상이 없습니다." };
    }

    const response = await fetchWithAuth(
      "/api/user_info_delete/",
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_uuids: userUuids, // 🔥 UUID 배열
        }),
      },
      { toast }
    );

    // refresh 실패 → fetchWithAuth가 null 리턴
    if (!response) {
      return {
        success: false,
        error: "인증 만료 또는 재로그인 필요",
      };
    }

    const text = await response.text();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      console.error("응답 JSON 파싱 실패");
      return {
        success: false,
        error: "서버 응답 파싱 실패",
      };
    }

    if (parsed?.success) {
      return {
        success: true,
        deletedUsers: parsed?.deleted_users || [],
      };
    }

    return {
      success: false,
      error: parsed?.message || "삭제 실패",
    };
  } catch (err) {
    console.error("삭제 중 예외 발생");
    return { success: false, error: err.message };
  }
};
  