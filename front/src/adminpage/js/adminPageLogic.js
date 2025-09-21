export async function fetchFilteredPeople(queryParams) {
  try {
    // filters 객체에서 값이 있는 항목만 쿼리 파라미터로 변환
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

    const res = await fetch(`/api/user_info_filtering/?${query}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

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