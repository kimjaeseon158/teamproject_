// 경로는 네 프로젝트에 맞게!
import { fetchWithAuth } from "../../../../services/api/fetchWithAuth";
import { API_BASE } from "../config/api";

export const AddUser_PostData = async (data, { toast } = {}) => {
  try {
    const response = await fetchWithAuth(
      `${API_BASE}/api/user_info_add/`,
      {
        method: "PATCH", // 백엔드가 PATCH로 받게 되어 있으면 그대로
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
      { toast }
    );

    // 🔁 refresh 실패시 fetchWithAuth가 null 반환 → 로그인 만료
    if (!response) {
      return {
        success: false,
        error: "인증 만료 또는 재로그인 필요",
      };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("서버 전송 오류");
    return {
      success: false,
      error: error.message,
    };
  }
};
