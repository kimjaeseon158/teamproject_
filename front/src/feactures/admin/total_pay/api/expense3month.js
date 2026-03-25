// src/js/total_payPost.js
import { fetchWithAuth } from "../../../../services/api/fetchWithAuth";
import { API_BASE } from "../config/api";

export async function three_month_totals(payload, toast) {
  try {
    const query = payload
      ? `?${new URLSearchParams(payload).toString()}`
      : "";

    const res = await fetchWithAuth(
      `${API_BASE}/api/expense_3months_totals/${query}`, // 🔥 슬래시 제거
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
      { toast }
    );

    if (!res) return null;

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