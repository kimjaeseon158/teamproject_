// src/admin/js/adminPageDelete.js
import { fetchWithAuth } from "../../../../services/api/fetchWithAuth";

/**
 * ?¬ì› ?? œ (UUID ê¸°ì?)
 * @param {string[]} userUuids - ?? œ??user_uuid ë°°ì—´
 */
export const deleteEmployees = async (userUuids, { toast } = {}) => {
  try {
    if (!Array.isArray(userUuids) || userUuids.length === 0) {
      return { success: false, error: "?? œ???€?ì´ ?†ìŠµ?ˆë‹¤." };
    }

    const deletedUsers = [];

    for (const uuid of userUuids) {
      const response = await fetchWithAuth(
        "/api/user-info-delete/",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_uuid: uuid, // ?”¥ ë¬¸ì???˜ë‚˜??ë³´ëƒ„
          }),
        },
        { toast }
      );

      if (!response) {
        return { success: false, error: "?¸ì¦ ë§Œë£Œ" };
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