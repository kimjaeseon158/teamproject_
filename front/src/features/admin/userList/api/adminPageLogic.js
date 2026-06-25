import { fetchWithAuth } from "../../../../services/api/fetchWithAuth";
export async function fetchFilteredPeople(queryParams, { toast } = {}) {
  try {
    const filters = queryParams.filters || {};
    const params = {};

    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        params[key] = filters[key];
      }
    });

    const query = new URLSearchParams(params).toString();

    const res = await fetchWithAuth(
      `/api/user-info-filtering/?${query}`,
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
    console.error("?쒕쾭 ?붿껌 ?ㅽ뙣");
    return [];
  }
}
