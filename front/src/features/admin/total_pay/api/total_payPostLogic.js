// src/js/total_payPost.js
import { fetchWithAuth } from "../../../../services/api/fetchWithAuth";

export async function total_payPost(payload, toast) {
  try {
    const query = payload ? `?${new URLSearchParams(payload).toString()}` : "";

    const res = await fetchWithAuth(
      `/api/finance-total/${query}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
      { toast } // ?듭뀡?쇰줈 toast ?섍?
    );

    if (!res) return null; // refresh ?ㅽ뙣 ??null 諛섑솚

    const data = await res.json();
    return data;
  } catch (err) {
    if (toast) {
      toast({
        title: "?ㅽ듃?뚰겕 ?ㅻ쪟",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    return null;
  }
}
