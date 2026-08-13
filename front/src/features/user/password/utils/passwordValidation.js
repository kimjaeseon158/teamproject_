export const hasKorean = (value) => /[가-힣]/.test(value);

export const getPasswordChecks = (values) => ({
  hasCurrentPassword: values.initialPassword.length > 0,
  minLength: values.newPassword.length >= 8,
  hasLetter: /[A-Za-z]/.test(values.newPassword),
  hasNumber: /\d/.test(values.newPassword),
  hasSpecial: /[^A-Za-z0-9가-힣]/.test(values.newPassword),
  isConfirmed:
    values.confirmPassword.length > 0 &&
    values.newPassword === values.confirmPassword,
});

export const canSubmitPasswordChange = ({ checks, hasKoreanInput, values }) =>
  Object.values(checks).every(Boolean) &&
  !hasKoreanInput &&
  values.newPassword !== values.initialPassword;
