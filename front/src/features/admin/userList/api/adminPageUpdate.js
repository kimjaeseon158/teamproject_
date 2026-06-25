// src/admin/js/adminPageUpdate.js
import { fetchWithAuth } from "../../../../services/api/fetchWithAuth";

/**
 * ?¬ì› ?•ë³´ ?˜ì • (UUID ê¸°ì?)
 * @param {Object} employeeData - ë°˜ë“œ??user_uuid ?¬í•¨
 */
export const updateEmployee = async (employeeData, { toast } = {}) => {
  try {
    // ?”¥ ?ˆì „?¥ì¹˜: UUID ?„ìˆ˜
    if (!employeeData?.user_uuid) {
      return {
        success: false,
        error: "user_uuidê°€ ?†ëŠ” ?°ì´?°ì…?ˆë‹¤.",
      };
    }

    const response = await fetchWithAuth(
      "/api/user-info-update/",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(employeeData), // user_uuid ?¬í•¨ ?„ì²´ ê°ì²´
      },
      { toast }
    );

    // refresh ?¤íŒ¨ ??fetchWithAuthê°€ null
    if (!response) {
      return {
        success: false,
        error: "?¸ì¦ ë§Œë£Œ ?ëŠ” ?¬ë¡œê·¸ì¸ ?„ìš”",
      };
    }

    const text = await response.text();

    let result;
    try {
      result = JSON.parse(text);
    } catch (err) {
      console.error("?…ë°?´íŠ¸ ?‘ë‹µ JSON ?Œì‹± ?¤íŒ¨");
      return {
        success: false,
        error: "?œë²„ ?‘ë‹µ ?Œì‹± ?¤íŒ¨",
      };
    }

    if (!response.ok || result?.success === false) {
      return {
        success: false,
        error: result?.message || "?…ë°?´íŠ¸ ?¤íŒ¨",
      };
    }

    return {
      success: true,
      updated: result?.updated_user || employeeData,
    };
  } catch (error) {
    console.error("?…ë°?´íŠ¸ ?ëŸ¬");
    return { success: false, error: error.message };
  }
};
