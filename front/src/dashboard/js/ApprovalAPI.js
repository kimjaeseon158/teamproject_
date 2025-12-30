// src/api/adminWorkday.js
import { fetchWithAuth } from "./fetchWithAuth";

/**
 * 어드민 근무내역 리스트 조회
 * GET /api/admin_page_workday/
 * 응답: { success: true, work_days: [...] }
 */
export async function getAdminWorkDays({ toast } = {}) {
  const res = await fetchWithAuth(
    "/api/admin_page_workday/",
    { method: "GET" },
    { toast }
  );

  if (!res.ok) {
    let msg = "근무내역 조회 실패";
    try {
      const err = await res.json();
      msg = err.detail || JSON.stringify(err);
    } catch (e) {}
    throw new Error(msg);
  }

  const json = await res.json();
  return json?.work_days || [];
}