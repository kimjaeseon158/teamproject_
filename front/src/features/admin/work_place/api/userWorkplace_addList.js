// src/js/total_payPost.js
import { fetchWithAuth } from "../../../../services/api/fetchWithAuth";

export async function getWorkaddPlaceList(payload, toast) {
  try {
    // fetchWithAuth ?¸ì¶œ
    const res = await fetchWithAuth(
      "/api/work-place-rate-list-create/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      { toast } // ?µì…˜?¼ë¡œ toast ?˜ê?
    );

    if (!res) throw new Error("?¸ì¦ ê°±ì‹ ???¤íŒ¨?ˆìŠµ?ˆë‹¤.");

    if (!res.ok) {
      let msg = "ê·¼ë¬´ì§€ ?œê¸‰ ì¶”ê????¤íŒ¨?ˆìŠµ?ˆë‹¤.";
      try {
        const err = await res.json();
        msg = err.detail || err.message || JSON.stringify(err);
      } catch {}
      throw new Error(msg);
    }

    return res.json().catch(() => ({}));
  } catch (err) {
    throw err;
  }
}
