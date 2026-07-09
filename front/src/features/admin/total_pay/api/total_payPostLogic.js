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
      { toast } // 옵션으로 toast 전달
    );

    if (!res) return null; // refresh 실패 시 null 반환

    const data = await res.json();
    return data;
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
