import { fetchWithAuth } from "../../../../services/api/fetchWithAuth";

export async function getWorkPlaceList(params = {}, toast) {
  try {
    // 🔥 값 있는 것만 query로 생성
    const query = new URLSearchParams(params).toString();
    const baseUrl =
      params.user_name || params.work_place
        ? "/api/work_place_rate_list_filtering/"
        : "/api/work_place_rate_list_create/";

    const res = await fetchWithAuth(
      `${baseUrl}${query ? `?${query}` : ""}`,
      { method: "GET" },
      { toast }
    );

    if (!res) return null;

    return await res.json();

  } catch (err) {
    if (toast) {
      toast({
        title: "네트워크 오류",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    return null;
  }
}