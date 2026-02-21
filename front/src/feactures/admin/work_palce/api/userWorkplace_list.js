
import { fetchWithAuth } from "../../../../services/api/fetchWithAuth";

export async function getWorkPlaceList(payload, toast) {
  try {
    const query = payload
      ? `?${new URLSearchParams(payload).toString()}`
      : "";

    const res = await fetchWithAuth(
      `/api/work_place_rate_list_create/${query}`,
      { method: "GET" },
      { toast }
    );

    if (!res) return null;

    const result = await res.json();
    return result;
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
