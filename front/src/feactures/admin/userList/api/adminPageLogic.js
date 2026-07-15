import { fetchWithAuth } from "../../../../services/api/fetchWithAuth";
import { API_BASE } from "../../../../config/api/apiEnv";

export async function fetchFilteredPeople(queryParams, { toast } = {}) {
  try {
    const filters = queryParams.filters || {};
    const params = {};

    // 🔥 모델 필드만 보내기
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        params[key] = filters[key];
      }
    });

    const query = new URLSearchParams(params).toString();

    const res = await fetchWithAuth(
      `${API_BASE}/api/user_info_filtering/?${query}`,
      { method: "GET" },
      { toast }
    );

    if (!res) return [];

    const result = await res.json();

    if (Array.isArray(result?.data)) {
      return result.data;
    }

    return [];
  } catch (err) {
    console.error("서버 요청 실패", err);
    return [];
  }
}