export const formatResidentNumber = (value) => {
  const sanitized_value = value.replace(/[^0-9]/g, "").slice(0, 13);
  return sanitized_value.length > 6
    ? sanitized_value.slice(0, 6) + "-" + sanitized_value.slice(6)
    : sanitized_value;
};

const RESIDENT_CENTURY_BY_CODE = {
  1: 1900,
  2: 1900,
  3: 2000,
  4: 2000,
  5: 1900,
  6: 1900,
  7: 2000,
  8: 2000,
};

const INVALID_BIRTH_DATE_MESSAGE = "생년월일의 날짜를 정확히 입력해 주세요.";

export const validateResidentNumber = (value, today = new Date()) => {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length !== 13) return INVALID_BIRTH_DATE_MESSAGE;

  const centuryCode = digits[6];
  const century = RESIDENT_CENTURY_BY_CODE[centuryCode];
  if (!century) return INVALID_BIRTH_DATE_MESSAGE;

  const shortYear = Number(digits.slice(0, 2));
  const month = Number(digits.slice(2, 4));
  const day = Number(digits.slice(4, 6));
  const year = century + shortYear;

  if (month < 1 || month > 12) {
    return INVALID_BIRTH_DATE_MESSAGE;
  }

  const birthDate = new Date(year, month - 1, day);
  const isValidDate =
    day >= 1 &&
    birthDate.getFullYear() === year &&
    birthDate.getMonth() === month - 1 &&
    birthDate.getDate() === day;
  if (!isValidDate) return INVALID_BIRTH_DATE_MESSAGE;

  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (birthDate > todayOnly) return INVALID_BIRTH_DATE_MESSAGE;

  return null;
};

export const formatPhoneNumber = (value) => {
  const sanitized_value = value.replace(/[^0-9]/g, "").slice(0, 11);

  if (sanitized_value.length >= 11) {
    return sanitized_value.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  } else if (sanitized_value.length >= 7) {
    return sanitized_value.replace(/(\d{3})(\d{4})(\d*)/, (_, g1, g2, g3) =>
      g3 ? `${g1}-${g2}-${g3}` : `${g1}-${g2}`
    );
  } else if (sanitized_value.length >= 4) {
    return sanitized_value.replace(/(\d{3})(\d*)/, (_, g1, g2) =>
      g2 ? `${g1}-${g2}` : g1
    );
  }
  return sanitized_value;
};

export const validatePhoneNumber = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length <= 3) return "전화번호를 입력해 주세요.";
  if (digits.length !== 11) return "전화번호 11자리를 모두 입력해 주세요.";
  if (!digits.startsWith("010")) return "전화번호를 010-1234-5678 형식으로 입력해 주세요.";
  return null;
};

export const validateEmployeeForm = (formData, { requireUserId = false } = {}) => {
  const errors = {};
  const name = String(formData?.user_name || "").trim();
  const address = String(formData?.address || "").trim();
  const userId = String(formData?.user_id || "").trim();

  if (!name) errors.user_name = "이름을 입력해 주세요.";

  const residentDigits = String(formData?.resident_number || "").replace(/\D/g, "");
  errors.resident_number = residentDigits.length
    ? validateResidentNumber(formData.resident_number)
    : "주민등록번호를 입력해 주세요.";

  if (!formData?.mobile_carrier) errors.mobile_carrier = "통신사를 선택해 주세요.";
  errors.phone_number = validatePhoneNumber(formData?.phone_number);

  if (!address) errors.address = "주소를 입력해 주세요.";
  if (requireUserId && !userId) errors.user_id = "아이디를 입력해 주세요.";

  return Object.fromEntries(Object.entries(errors).filter(([, message]) => Boolean(message)));
};

export const getEmployeeSaveErrorMessage = (message, fallback) => {
  const text = String(message || "");
  if (/user[_ ]?id|아이디/i.test(text) && /duplicate|exist|already|중복|사용|등록/i.test(text)) {
    return "이미 사용 중인 아이디입니다.";
  }
  if (/phone|전화/i.test(text) && /duplicate|exist|already|중복|사용|등록/i.test(text)) {
    return "이미 등록된 전화번호입니다.";
  }
  if (/resident|주민/i.test(text) && /duplicate|exist|already|중복|사용|등록/i.test(text)) {
    return "이미 등록된 주민등록번호입니다.";
  }
  if (/failed to fetch|network\s*error|load failed/i.test(text)) {
    return "서버에 연결할 수 없습니다. 네트워크 상태를 확인해 주세요.";
  }
  return fallback;
};
