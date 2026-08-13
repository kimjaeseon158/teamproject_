import { ApiRawGet, toQueryString } from "../../../../services/api/requestJson";
import { clearGoogleLinked } from "./googleLinkStorage";

const GOOGLE_AUTH_EXPIRED_MESSAGE =
  "Google Drive 인증이 만료되었습니다. 다시 Google 연동을 시도해주세요.";

const isGoogleAuthExpired = (status) => status === 401 || status === 403;

const googleAuthExpiredResult = () => {
  clearGoogleLinked();
  return {
    success: false,
    code: "GOOGLE_AUTH_EXPIRED",
    message: GOOGLE_AUTH_EXPIRED_MESSAGE,
  };
};

export const exportToGoogleExcel = async (work_place, date) => {
  const url = `/api/google-drive-excel-export/${toQueryString({
    date,
    work_place,
  })}`;

  return requestGoogleDriveExport(url, "Google Drive에 파일이 생성되었습니다.");
};

const requestGoogleDriveExport = async (
  url,
  successMessage = "Google Drive에 엑셀 파일이 생성되었습니다."
) => {
  const res = await ApiRawGet(url);

  if (!res) {
    return {
      success: false,
      message: "서버 응답을 받지 못했습니다.",
    };
  }

  const contentType = res.headers.get("content-type") || "";

  if (!res.ok) {
    if (isGoogleAuthExpired(res.status)) {
      return googleAuthExpiredResult();
    }

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
    message: successMessage,
  };
};

export const exportApprovalSalaryExcel = async (date) =>
  requestGoogleDriveExport(
    `/api/google-drive-salary-excel-export/${toQueryString({ date })}`
  );

export const exportUserPayExcel = async (date) =>
  requestGoogleDriveExport(
    `/api/google-drive-user-pay-excel-export/${toQueryString({ date })}`
  );
