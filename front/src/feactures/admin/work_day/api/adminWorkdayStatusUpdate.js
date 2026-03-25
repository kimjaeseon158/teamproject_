// src/api/adminWorkdayStatusUpdate.js
import { fetchWithAuth } from "../../../../services/api/fetchWithAuth";
import { API_BASE } from "../../../../config/api/apiEnv";
/**
 * 어드민 근무 승인 / 반려 상태 업데이트
 * PATCH /api/admin_workday_status_update/
 *
 * payload:
 * {
 *   user_uuid: string,            // 사용자 UUID
 *   work_date: "YYYY-MM-DD",      // 근무일
 *   work_shift: string,           // 근무 구분 (주간, 잔업 등)
 *   status: "Y" | "N",            // Y: 승인, N: 반려
 *   reject_reason?: string        // 반려 사유 (status === "N"일 때)
 * }
 */
export async function adminWorkdayStatusUpdate(payload, { toast } = {}) {
  const res = await fetchWithAuth(
    `${API_BASE}/api/admin_workday_status_update/`,
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
