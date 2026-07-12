export const INITIAL_PASSWORD = "1234";

export const hasKorean = (value) => /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(value);

export const getPasswordChecks = (values) => ({
  isInitialPasswordValid: values.initialPassword === INITIAL_PASSWORD,
  minLength: values.newPassword.length >= 8,
  hasLetter: /[A-Za-z]/.test(values.newPassword),
  hasNumber: /\d/.test(values.newPassword),
  hasSpecial: /[^A-Za-z0-9ㄱ-ㅎㅏ-ㅣ가-힣]/.test(values.newPassword),
  isConfirmed:
    values.confirmPassword.length > 0 &&
    values.newPassword === values.confirmPassword,
});

export const canSubmitPasswordChange = ({ checks, hasKoreanInput, values }) =>
  Object.values(checks).every(Boolean) &&
  !hasKoreanInput &&
  values.newPassword !== INITIAL_PASSWORD;
