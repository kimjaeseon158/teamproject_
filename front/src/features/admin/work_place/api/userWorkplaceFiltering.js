import { fetchWithAuth } from "../../../../services/api/fetchWithAuth";

export async function getWorkPlaceFiltering({ user_name, work_place }, toast) {
  try {
    const query = new URLSearchParams({
      user_name,
      work_place,
    }).toString();

    const res = await fetchWithAuth(
      `/api/work-place-rate-list-filtering/?${query}`,
      { method: "GET" },
      { toast }
    );

    if (!res) return null;

    return await res.json();
  } catch (err) {
    if (toast) {
      toast({
        title: "?§Ìä∏?åÌÅ¨ ?§Î•ò",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    return null;
  }
}