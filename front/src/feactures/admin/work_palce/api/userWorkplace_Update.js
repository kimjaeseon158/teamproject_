// src/api/adminWorkdayStatusUpdate.js
import { fetchWithAuth } from "../../../../services/api/fetchWithAuth";
import { API_BASE } from "../../../../config/api/apiEnv";

export async function getWorkPlaceList_Update(payload, { toast } = {}) {
  const res = await fetchWithAuth(
    `${API_BASE}/api/work_place_rate_update_delete/`,
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
