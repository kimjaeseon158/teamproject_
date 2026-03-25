// src/admin/js/adminPageDelete.js
import { fetchWithAuth } from "../../../../services/api/fetchWithAuth";
import { API_BASE } from "../../../../config/api/apiEnv";
/**
 * 사원 삭제 (UUID 기준)
 * @param {string[]} userUuids - 삭제할 user_uuid 배열
 */
export const deleteEmployees = async (userUuids, { toast } = {}) => {
  try {
    if (!Array.isArray(userUuids) || userUuids.length === 0) {
      return { success: false, error: "삭제할 대상이 없습니다." };
    }

    const deletedUsers = [];

    for (const uuid of userUuids) {
      const response = await fetchWithAuth(
        `${API_BASE}/api/user_info_delete/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_uuid: uuid, // 🔥 문자열 하나씩 보냄
          }),
        },
        { toast }
      );

      if (!response) {
        return { success: false, error: "인증 만료" };
      }

      const parsed = await response.json();

      if (parsed?.success) {
        deletedUsers.push(uuid);
      }
    }

    return { success: true, deletedUsers };
  } catch (err) {
    return { success: false, error: err.message };
  }
};