import { fetchWithAuth } from "../../../../services/api/fetchWithAuth";
import { clearGoogleLinked } from "./googleLinkStorage";

const GOOGLE_AUTH_EXPIRED_MESSAGE =
  "Google Drive ?¸ì¦??ë§Œë£Œ?˜ì—ˆ?µë‹ˆ?? ?¤ì‹œ êµ¬ê? ?°ë™ ???œë„?´ì£¼?¸ìš”.";

const isGoogleAuthExpired = (status) => status === 401 || status === 403;

const googleAuthExpiredResult = () => {
  clearGoogleLinked();
  return {
    success: false,
    code: "GOOGLE_AUTH_EXPIRED",
    message: GOOGLE_AUTH_EXPIRED_MESSAGE,
  };
};

/**
 * êµ¬ê? ?œë¼?´ë¸Œ ?‘ì? ?…ë¡œ??API ?¸ì¶œ (GET ë°©ì‹)
 * @param {string} work_place - ê·¼ë¬´ì§€ (?? "A?„ìž¥")
 * @param {string} date - ? ì§œ (?? "2026-04-03")
 */
export const exportToGoogleExcel = async (work_place, date) => {
  try {
    // GET ë°©ì‹?´ë?ë¡??°ì´?°ë? URL ?¤ì— ?key=value ?•íƒœë¡?ë¶™ì—¬??ë³´ëƒ…?ˆë‹¤.
    const params = { date, work_place: work_place || "" };
    const queryParams = new URLSearchParams(params).toString();
    const url = `/api/google-drive-excel-export/?${queryParams}`;

    const res = await fetchWithAuth(url, {
      method: "GET",
    });

    if (!res) {
      return {
        success: false,
        message: "?œë²„ ?‘ë‹µ??ë°›ì? ëª»í–ˆ?µë‹ˆ??",
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
            "?‘ì? ?ì„± ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.",
        };
      }

      return {
        success: false,
        message: "?‘ì? ?ì„± ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.",
      };
    }

    if (contentType.includes("application/json")) {
      return await res.json();
    }

    return {
      success: true,
      message: "êµ¬ê? ?œë¼?´ë¸Œ???Œì¼???ì„±?˜ì—ˆ?µë‹ˆ??",
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
      message: "?œë²„ ?‘ë‹µ??ë°›ì? ëª»í–ˆ?µë‹ˆ??",
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
          "?‘ì? ?ì„± ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.",
      };
    }

    return {
      success: false,
      message: "?‘ì? ?ì„± ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.",
    };
  }

  if (contentType.includes("application/json")) {
    return await res.json();
  }

  return {
    success: true,
    message: "Google Drive???‘ì? ?Œì¼???ì„±?˜ì—ˆ?µë‹ˆ??",
  };
};

export const exportApprovalSalaryExcel = async (date) => {
  const queryParams = new URLSearchParams({ date }).toString();
  return requestGoogleDriveExport(
    `/api/google-drive-salary-excel-export/?${queryParams}`
  );
};

export const exportUserPayExcel = async (date) => {
  const queryParams = new URLSearchParams({ date }).toString();
  return requestGoogleDriveExport(
    `/api/google-drive-user-pay-excel-export/?${queryParams}`
  );
};
