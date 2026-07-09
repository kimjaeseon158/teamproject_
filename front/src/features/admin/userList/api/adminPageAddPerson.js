// 寃쎈줈?????꾨줈?앺듃??留욊쾶!
import { fetchWithAuth } from "../../../../services/api/fetchWithAuth";

export const AddUser_PostData = async (data, { toast } = {}) => {
  try {
    const response = await fetchWithAuth(
      "/api/user-info-add/",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
      { toast }
    );

    // ?봺 refresh ?ㅽ뙣??fetchWithAuth媛 null 諛섑솚 ??濡쒓렇??留뚮즺
    if (!response) {
      return {
        success: false,
        error: "인증 만료 또는 로그인 필요",
      };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("?쒕쾭 ?꾩넚 ?ㅻ쪟");
    return {
      success: false,
      error: error.message,
    };
  }
};
