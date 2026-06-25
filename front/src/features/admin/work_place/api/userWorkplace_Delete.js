// src/js/total_payPost.js
import { fetchWithAuth } from "../../../../services/api/fetchWithAuth";

export async function getWorkplaceList_Delete(payload, toast) {
  try {
    // fetchWithAuth ?¸ì¶œ
    const res = await fetchWithAuth(
      "/api/work-place-rate-update-delete/",
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      { toast } // ?µì…˜?¼ë¡œ toast ?˜ê?
    );

    if (!res) throw new Error("?¸ì¦ ê°±ì‹ ???¤íŒ¨?ˆìŠµ?ˆë‹¤.");

    if (!res.ok) {
      let msg = "ê·¼ë¬´ì§€ ?œê¸‰ ?? œ???¤íŒ¨?ˆìŠµ?ˆë‹¤.";
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
