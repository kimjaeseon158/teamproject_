import { RATE_FIELDS } from "../constants/rateFields";

export const normalizeRateHistory = (rate = {}) => ({
  ...rate,
  effective_start_date:
    rate.effective_start_date ?? rate.start_date ?? rate.started_at ?? "",
  effective_end_date:
    rate.effective_end_date ?? rate.end_date ?? rate.ended_at ?? null,
});

const getLocalDateValue = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const isCurrentRateHistory = (rate = {}) =>
  Boolean(rate.effective_start_date) &&
  (!rate.effective_end_date || rate.effective_end_date >= getLocalDateValue());

export const isEndedRateHistory = (rate = {}) =>
  Boolean(rate.effective_end_date) &&
  rate.effective_end_date < getLocalDateValue();

export const buildRateRequest = (values, { includeUser = false } = {}) => {
  const payload = {
    ...(includeUser ? { user_uuid: values.user_uuid } : {}),
    ...(values.admin_work_place_uuid
      ? { admin_work_place_uuid: values.admin_work_place_uuid }
      : { work_place: values.work_place }),
    effective_start_date: values.effective_start_date,
    effective_end_date: values.effective_end_date || null,
  };

  RATE_FIELDS.forEach(({ key }) => {
    if (values[key] !== "" && values[key] != null) {
      payload[key] = Number(values[key]);
    }
  });

  return payload;
};

export const getRateValidationMessage = (rows) => {
  const missingStartDate = rows.some((row) => !row.effective_start_date);
  if (missingStartDate) return "시작일은 필수입니다.";

  const invalidPeriod = rows.some(
    (row) =>
      row.effective_end_date &&
      row.effective_start_date > row.effective_end_date
  );
  if (invalidPeriod) return "종료일은 시작일보다 빠를 수 없습니다.";

  return null;
};

export const getRateApiErrorMessage = (error, fallback) => {
  const response = error?.data || error;
  const errors = response?.errors || response;
  if (errors && typeof errors === "object") {
    const message = Object.values(errors).find((value) => typeof value === "string");
    if (message) return message;
  }
  return response?.message || error?.message || fallback;
};
