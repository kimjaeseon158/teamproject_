// src/api/adminWorkdayStatusUpdate.js
import { fetchWithAuth } from "../../../../services/api/fetchWithAuth";

/**
 * 어드민 근무 승인 / 반려 상태 업데이트
 * PATCH /api/admin-workday-status-update/
 *
 * payload:
 * {
 *   user_uuid: string,            // 사용자 UUID
 *   work_date: "YYYY-MM-DD",      // 근무일
 *   work_shift: string,           // 근무 구분 (주간, 야간 등)
 *   status: "Y" | "N",            // Y: 승인, N: 반려
 *   reject_reason?: string        // 반려 사유 (status === "N")
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
    let msg = "상태 업데이트 실패";
    try {
      const err = await res.json();
      msg = err.detail || err.message || JSON.stringify(err);
    } catch {}
    throw new Error(msg);
  }

  return res.json().catch(() => ({}));
}
