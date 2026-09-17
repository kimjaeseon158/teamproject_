import { RATE_FIELDS, initialRateForm } from "../constants/rateFields";
import { toNumberOrNull } from "./rateFormat";

export const toWorkPlaceForm = (place = {}) => ({
  ...initialRateForm,
  ...Object.keys(initialRateForm).reduce((next, key) => {
    next[key] = place[key] ?? "";
    return next;
  }, {}),
});

export const buildWorkPlacePayload = (form, isEditMode) => ({
  ...(isEditMode ? { admin_work_place_uuid: form.admin_work_place_uuid } : {}),
  work_place: form.work_place.trim(),
  ...RATE_FIELDS.reduce((next, field) => {
    next[field.key] = toNumberOrNull(form[field.key]);
    return next;
  }, {}),
});

