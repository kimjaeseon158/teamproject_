export const ERROR_MESSAGES = {
  common: {
    network: "서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.",
    sessionExpired: "세션이 만료되었습니다. 다시 로그인해주세요.",
    invalidResponse: "서버 응답을 확인할 수 없습니다.",
    requestFailed: "요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  },
  login: {
    invalidCredentials: "아이디 또는 비밀번호를 확인해주세요.",
    invalidAdminCode: "관리자 인증 코드를 확인해주세요.",
    sessionCreationFailed:
      "로그인 정보는 확인되었지만 세션을 생성하지 못했습니다. 다시 로그인해주세요.",
    failed: "로그인 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  },
  workRegistration: {
    requiredFields: "근무지와 출퇴근 시간을 모두 입력해주세요.",
    duplicate: "이미 등록된 근무 정보가 있습니다.",
    failed: "근무 등록에 실패했습니다. 입력한 내용은 유지됩니다.",
  },
  approval: {
    approveFailed: "승인에 실패했습니다. 잠시 후 다시 시도해주세요.",
    rejectFailed: "반려에 실패했습니다. 잠시 후 다시 시도해주세요.",
    rejectReasonRequired: "반려 사유를 입력해주세요.",
    bulkFailed: "선택한 근무 내역의 일괄 처리에 실패했습니다.",
  },
  workplace: {
    nameRequired: "근무지명을 입력해주세요.",
    createFailed: "근무지 등록에 실패했습니다.",
    updateFailed: "근무지 수정에 실패했습니다.",
    deleteFailed: "근무지 삭제에 실패했습니다.",
  },
  document: {
    excelFailed: "엑셀 생성에 실패했습니다.",
    documentFailed: "문서 생성에 실패했습니다.",
    emptyResponse: "서버에서 생성 결과를 받지 못했습니다.",
  },
};

const NETWORK_ERROR_PATTERN = /failed to fetch|network\s*error|load failed/i;

export const getErrorMessage = (error, fallback = ERROR_MESSAGES.common.requestFailed) => {
  if (
    error?.code === "NETWORK_ERROR" ||
    error instanceof TypeError ||
    NETWORK_ERROR_PATTERN.test(error?.message || "")
  ) {
    return ERROR_MESSAGES.common.network;
  }

  if (error?.status === 401 || error?.status === 403) {
    return ERROR_MESSAGES.common.sessionExpired;
  }

  return error?.message || fallback;
};
