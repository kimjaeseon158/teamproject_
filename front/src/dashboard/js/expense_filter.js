// src/js/expense_filter.js
import { fetchWithAuth } from "../../api/fetchWithAuth";

export async function expense_filter_Data({ start, end }, toast) {
  try {
    const startStr = start.toISOString().split("T")[0]; // 2025-09-22
    const endStr = end.toISOString().split("T")[0];     // 2025-09-25 등
    const url = `/api/expense_filtered/?start=${startStr}&end=${endStr}`;

    const res = await fetchWithAuth(url, { method: "GET" }, { toast });
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
