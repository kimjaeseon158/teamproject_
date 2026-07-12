import { ApiGet, toQueryString } from "../../../../services/api/requestJson";

export async function fetchFilteredPeople(queryParams, { toast } = {}) {
  try {
    const filters = queryParams.filters || {};
    const data = await ApiGet(
      `/api/user-info-filtering/${toQueryString(filters)}`,
      { toast }
    );

    return Array.isArray(data?.data) ? data.data : [];
  } catch (err) {
    console.error("서버 요청 실패", err);
    return [];
  }
}
