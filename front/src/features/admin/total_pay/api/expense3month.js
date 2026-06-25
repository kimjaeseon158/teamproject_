// src/js/total_payPost.js
import { fetchWithAuth } from "../../../../services/api/fetchWithAuth";

export async function three_month_totals(payload, toast) {
  try {
    const query = payload
      ? `?${new URLSearchParams(payload).toString()}`
      : "";

    const res = await fetchWithAuth(
      `/api/expense-3months-totals/${query}`, // ?î• ?¨Îûò???úÍ±∞
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