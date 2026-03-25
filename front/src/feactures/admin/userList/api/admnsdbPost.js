import { fetchWithAuth } from "../../../../services/api/fetchWithAuth";
import { API_BASE } from "../../../../config/api/apiEnv";
/**
 * GET 방식으로 사용자 리스트 조회
 * -> data는 쿼리스트링으로 변환해서 전달
 * -> refresh token 자동 처리
 */
export const Panel_PostData = async (data = {}, toast) => {
  try {
    // ① data 객체 → 쿼리스트링 변환
    const query = new URLSearchParams(data).toString();

    // ② GET + fetchWithAuth 사용
    const res = await fetchWithAuth(
      `${API_BASE}/api/user_info_list/?${query}`,  // GET 방식으로 data 전달
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
      { toast }
    );

    if (!res || !res.ok) {

      if (toast) {
        toast({
          title: "유저 정보 조회 실패",
          description: `상태 코드: ${res?.status}`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }

      return null;
    }

    const result = await res.json();
    return result;

  } catch (error) {
    console.error("Panel_PostData 네트워크 오류");

    if (toast) {
      toast({
        title: "네트워크 오류",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    throw error;
  }
};
