// src/js/total_payPost.js
import { fetchWithAuth } from "../../api/fetchWithAuth";

export async function total_payPost(payload, toast) {
  try {
    // fetchWithAuth 호출
    const res = await fetchWithAuth(
      "/api/finance_total/",
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      { toast } // 옵션으로 toast 넘김
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
