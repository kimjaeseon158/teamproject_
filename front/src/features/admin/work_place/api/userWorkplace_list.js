import { fetchWithAuth } from "../../../../services/api/fetchWithAuth";

export async function getWorkPlaceList(params = {}, toast) {
  try {
    const hasFilter = Boolean(
      params.user_name?.trim() || params.work_place?.trim()
    );
    const query = new URLSearchParams(params).toString();
    const url = hasFilter
      ? `/api/work-place-rate-list-filtering/${query ? `?${query}` : ""}`
      : "/api/work-place-rate-list-create/";

    const res = await fetchWithAuth(
      url,
      { method: "GET" },
      { toast }
    );

    if (!res) return null;

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        data.detail || data.message || "근무지 ?�급 목록 조회???�패?�습?�다."
      );
    }

    return {
      ...data,
      success: data.success === true || data.success === "true",
      users: Array.isArray(data.users) ? data.users : [],
    };

  } catch (err) {
    if (toast) {
      toast({
        title: "?�트?�크 ?�류",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    return null;
  }
}
