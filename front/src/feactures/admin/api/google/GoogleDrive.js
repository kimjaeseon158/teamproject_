import { fetchWithAuth } from "../../../../services/api/fetchWithAuth";

/**
 * 구글 드라이브 엑셀 업로드 API 호출 (GET 방식)
 * @param {string} work_place - 근무지 (예: "A현장")
 * @param {string} date - 날짜 (예: "2026-04-03")
 */
export const exportToGoogleExcel = async (work_place, date) => {
  try {
    // GET 방식이므로 데이터를 URL 뒤에 ?key=value 형태로 붙여서 보냅니다.
    const queryParams = new URLSearchParams({ work_place, date }).toString();
    const url = `/api/google_drive_excel_export/?${queryParams}`;

    const res = await fetchWithAuth(url, {
      method: "GET",
    });

    if (!res) return null;

    // 성공 시 JSON 데이터 반환
    return await res.json();
  } catch (err) {
    console.error("Google Drive Export Error (GET):", err);
    throw err;
  }
};
