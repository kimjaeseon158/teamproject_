const STORAGE_KEY = "userLoginFailures:v1";
export const MAX_LOGIN_FAILURES = 5;

export const normalizeUserId = (userId = "") => userId.trim().toLowerCase();

const readFailures = () => {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return value && typeof value === "object" ? value : {};
  } catch {
    return {};
  }
};

export const getLoginFailures = (userId) => {
  const key = normalizeUserId(userId);
  if (!key) return 0;
  return Math.min(Number(readFailures()[key]) || 0, MAX_LOGIN_FAILURES);
};

export const incrementLoginFailures = (userId) => {
  const key = normalizeUserId(userId);
  if (!key) return 0;
  const failures = readFailures();
  const next = Math.min((Number(failures[key]) || 0) + 1, MAX_LOGIN_FAILURES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...failures, [key]: next }));
  return next;
};

export const clearLoginFailures = (userId) => {
  const key = normalizeUserId(userId);
  if (!key) return;
  const failures = readFailures();
  delete failures[key];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(failures));
};
