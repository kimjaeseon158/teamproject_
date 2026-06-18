import { fetchWithAuth } from "../../../../services/api/fetchWithAuth";

/**
 * 구글 드라이브 엑셀 업로드 API 호출 (GET 방식)
 * @param {string} work_place - 근무지 (예: "A현장")
 * @param {string} date - 날짜 (예: "2026-04-03")
 */
export const exportToGoogleExcel = async (work_place, date) => {
  try {
    // GET 방식이므로 데이터를 URL 뒤에 ?key=value 형태로 붙여서 보냅니다.
    const params = { date, work_place: work_place || "" };
    const queryParams = new URLSearchParams(params).toString();
    const url = `/api/google_drive_excel_export/?${queryParams}`;

    const res = await fetchWithAuth(url, {
      method: "GET",
    });

    if (!res) {
      return {
        success: false,
        message: "서버 응답을 받지 못했습니다.",
      };
    }

    const contentType = res.headers.get("content-type") || "";

    if (!res.ok) {
      if (contentType.includes("application/json")) {
        const errorData = await res.json();
        return {
          success: false,
          message:
            errorData.message ||
            errorData.error ||
            "엑셀 생성 중 오류가 발생했습니다.",
        };
      }

      return {
        success: false,
        message: "엑셀 생성 중 오류가 발생했습니다.",
      };
    }

    if (contentType.includes("application/json")) {
      return await res.json();
    }

    return {
      success: true,
      message: "구글 드라이브에 파일이 생성되었습니다.",
    };
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const requestGoogleDriveExport = async (url) => {
  const res = await fetchWithAuth(url, {
    method: "GET",
  });

  if (!res) {
    return {
      success: false,
      message: "서버 응답을 받지 못했습니다.",
    };
  }

  const contentType = res.headers.get("content-type") || "";

  if (!res.ok) {
    if (contentType.includes("application/json")) {
      const errorData = await res.json();
      return {
        success: false,
        message:
          errorData.message ||
          errorData.error ||
          "엑셀 생성 중 오류가 발생했습니다.",
      };
    }

    return {
      success: false,
      message: "엑셀 생성 중 오류가 발생했습니다.",
    };
  }

  if (contentType.includes("application/json")) {
    return await res.json();
  }

  return {
    success: true,
    message: "Google Drive에 엑셀 파일이 생성되었습니다.",
  };
};

export const exportApprovalSalaryExcel = async (date) => {
  const queryParams = new URLSearchParams({ date }).toString();
  return requestGoogleDriveExport(
    `/api/google_drive_salary_excel_export/?${queryParams}`
  );
};

export const exportUserPayExcel = async (date) => {
  const queryParams = new URLSearchParams({ date }).toString();
  return requestGoogleDriveExport(
    `/api/google_drive_user_pay_excel_export/?${queryParams}`
  );
};
