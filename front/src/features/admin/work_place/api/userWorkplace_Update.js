// src/api/adminWorkdayStatusUpdate.js
import { fetchWithAuth } from "../../../../services/api/fetchWithAuth";

export async function getWorkPlaceList_Update(payload, { toast } = {}) {
  const res = await fetchWithAuth(
    "/api/work-place-rate-update-delete/",
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    { toast }
  );

  if (!res.ok) {
    let msg = "?íƒœ ?…ë°?´íŠ¸ ?¤íŒ¨";
    try {
      const err = await res.json();
      msg = err.detail || err.message || JSON.stringify(err);
    } catch {}
    throw new Error(msg);
  }

  return res.json().catch(() => ({}));
}
