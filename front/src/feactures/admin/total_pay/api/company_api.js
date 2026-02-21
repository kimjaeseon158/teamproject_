// src/js/total_payPost.js
import { fetchWithAuth } from "../../../../services/api/fetchWithAuth";

/**
 * 회사 매출(수입) 등록 API
 * POST /api/income_add/
 *
 * payload:
 * {
 *   date: "YYYY-MM-DD",        // 매출 발생일
 *   company_name: string,      // 업체명
 *   company_detail?: string,   // 상세 내용 (선택)
 *   amount: number             // 금액
 * }
 *
 * @param {Object} payload  매출 데이터
 * @param {Function} toast  Chakra UI toast 함수 (선택)
 *
 * @returns {Object|null}
 *  - 성공: 서버 응답 JSON
 *  - 실패: null
 */
export async function income_Data(payload, toast) {
  try {
    const res = await fetchWithAuth(
      "/api/income_add/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      { toast }
    );

    if (!res) return null; // 인증/네트워크 문제 등

    const data = await res.json();
    return data;
  } catch (err) {
    if (toast) {
      toast({
        title: "네트워크 오류",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    return null;
  }
}
