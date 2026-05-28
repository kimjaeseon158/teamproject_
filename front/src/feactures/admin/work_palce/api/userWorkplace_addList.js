// src/js/total_payPost.js
import { fetchWithAuth } from "../../../../services/api/fetchWithAuth";

export async function getWorkaddPlaceList(payload, toast) {
  try {
    // fetchWithAuth 호출
    const res = await fetchWithAuth(
      "/api/work_place_rate_list_create/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      { toast } // 옵션으로 toast 넘김
    );

    if (!res) throw new Error("인증 갱신에 실패했습니다.");

    if (!res.ok) {
      let msg = "근무지 시급 추가에 실패했습니다.";
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
