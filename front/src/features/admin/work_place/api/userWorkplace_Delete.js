// src/js/total_payPost.js
import { fetchWithAuth } from "../../../../services/api/fetchWithAuth";

export async function getWorkplaceList_Delete(payload, toast) {
  try {
    // fetchWithAuth 호출
    const res = await fetchWithAuth(
      "/api/work-place-rate-update-delete/",
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      { toast } // 옵션으로 toast 전달
    );

    if (!res) throw new Error("인증 갱신에 실패했습니다.");

    if (!res.ok) {
      let msg = "근무지 일급 삭제에 실패했습니다.";
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
