import { fetchWithAuth } from "../../../../services/api/fetchWithAuth";

export async function getWorkPlaceFiltering({ user_name, work_place }, toast) {
  try {
    const query = new URLSearchParams({
      user_name,
      work_place,
    }).toString();

    const res = await fetchWithAuth(
      `/api/work_place_rate_list_filtering/?${query}`,
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