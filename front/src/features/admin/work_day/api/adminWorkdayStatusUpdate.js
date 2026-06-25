// src/api/adminWorkdayStatusUpdate.js
import { fetchWithAuth } from "../../../../services/api/fetchWithAuth";

/**
 * ?�드�?근무 ?�인 / 반려 ?�태 ?�데?�트
 * PATCH /api/admin-workday-status-update/
 *
 * payload:
 * {
 *   user_uuid: string,            // ?�용??UUID
 *   work_date: "YYYY-MM-DD",      // 근무?? *   work_shift: string,           // 근무 구분 (주간, ?�업 ??
 *   status: "Y" | "N",            // Y: ?�인, N: 반려
 *   reject_reason?: string        // 반려 ?�유 (status === "N"????
 * }
 */
export async function adminWorkdayStatusUpdate(payload, { toast } = {}) {
  const res = await fetchWithAuth(
    "/api/admin-workday-status-update/",
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    { toast }
  );

  if (!res.ok) {
    let msg = "?�태 ?�데?�트 ?�패";
    try {
      const err = await res.json();
      msg = err.detail || err.message || JSON.stringify(err);
    } catch {}
    throw new Error(msg);
  }

  return res.json().catch(() => ({}));
}
