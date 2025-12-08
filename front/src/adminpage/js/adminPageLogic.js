// 예: 경로는 네 프로젝트 구조에 맞게 수정해줘
import { fetchWithAuth } from "../../api/fetchWithAuth";

export async function fetchFilteredPeople(queryParams, { toast } = {}) {
  try {
    const filters = queryParams.filters || {};
    const params = {};

    // 필드가 비어있지 않으면 params에 추가
    Object.keys(filters).forEach((key) => {
      if (filters[key]) params[key] = filters[key];
    });

    // 정렬 정보가 있으면 추가
    if (queryParams.sort?.direction && queryParams.sort.key) {
      params.sorting =
        queryParams.sort.direction === "desc"
          ? "-" + queryParams.sort.key
          : queryParams.sort.key;
    }

    // URLSearchParams로 쿼리스트링 생성
    const query = new URLSearchParams(params).toString();

    // ✅ 여기서부터는 fetch 대신 fetchWithAuth 사용
    const res = await fetchWithAuth(
      `/api/user_info_filtering/?${query}`,
      {
        method: "GET",
        // GET이면 Content-Type 없어도 됨. 필요하면 추가 가능
        headers: { "Content-Type": "application/json" },
      },
      { toast } // 선택: 토스트 쓰고 싶으면 넘기고, 아니면 파라미터 빼도 됨
    );

    // 🔴 refresh 실패 시 fetchWithAuth가 null 리턴하도록 해놨다면:
    if (!res) {
      return []; // 이미 로그인 페이지로 튕겼을 가능성 높음
    }

    if (!res.ok) {
      console.error("서버 응답 오류:", res.status);
      return [];
    }

    const result = await res.json();
    console.log(result.data);

    if (Array.isArray(result?.data)) {
      return result.data;
    } else {
      console.warn("예상하지 않은 응답 구조:", result);
      return [];
    }
  } catch (err) {
    console.error("서버 요청 실패:", err);
    return [];
  }
}
