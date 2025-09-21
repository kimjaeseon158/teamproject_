export async function fetchFilteredPeople(queryParams) {
  try {
    const payload = {
        filtering: queryParams.filters,
        ...(queryParams.sort?.direction
          ? {
              sorting:
                queryParams.sort.direction === "desc"
                  ? "-" + queryParams.sort.key
                  : queryParams.sort.key,
            }
          : {}),
    };

    const res = await fetch("/api/user_info_filtering/", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include"
    });

    const result = await res.json();
    console.log(result.data)
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
