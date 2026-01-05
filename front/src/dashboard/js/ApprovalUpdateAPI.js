// src/api/adminWorkdayStatusUpdate.js
import { fetchWithAuth } from "../../api/fetchWithAuth";

/**
 * 어드민 근무 승인/반려 업데이트
 * PATCH /api/admin-workday-status-update/
 *
 * 승인:
 * { employee_number, work_date, status: "Y" }
 *
 * 거절:
 * { employee_number, work_date, status: "N", reject_reason }
 */
export async function adminWorkdayStatusUpdate(payload, { toast } = {}) {
  const res = await fetchWithAuth(
    "/api/admin_workday_status_update/",
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    { toast }
  );

  if (!res.ok) {
    let msg = "상태 업데이트 실패";
    try {
      const err = await res.json();
      msg = err.detail || err.message || JSON.stringify(err);
    } catch {}
    throw new Error(msg);
  }

  return res.json().catch(() => ({}));
}
