import { useEffect, useMemo, useRef, useState } from "react";

import { toWorkPlaceForm, buildWorkPlacePayload } from "../utils/workPlaceForm";
import { RATE_FIELDS, initialRateForm } from "../constants/rateFields";
import { notify } from "../utils/rateFormat";
import {
  createAdminWorkPlace,
  deleteAdminWorkPlace,
  updateAdminWorkPlace,
} from "../api/adminWorkPlace";
import { ERROR_MESSAGES, getErrorMessage } from "../../../../constants/errorMessages";


export default function useAdminWorkPlaceModal({
  isOpen,
  onClose,
  onSuccess,
  toast,
  workPlaces,
}) {
  const [form, setForm] = useState(initialRateForm);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [registration, setRegistration] = useState(null);
  const submitting = useRef(false);
  const cancelRegistration = () => {
    if (!submitting.current) setRegistration(null);
  };
  const confirmRegistration = async () => {
    if (!registration || submitting.current) return;
    submitting.current = true;
    setSaving(true);
    try {
      const result = await createAdminWorkPlace(registration.place, toast);
      if (result?.success === false) throw new Error(result.message || "근무지 등록에 실패했습니다.");
      setForm(toWorkPlaceForm(result?.work_places?.[0] || workPlaces[0]));
      setSearch("");
      setIsAdding(false);
      setRegistration(null);
      await onSuccess?.();
    } catch (err) {
      notify(toast, { title: "근무지 등록 중 오류가 발생했습니다.", description: getErrorMessage(err, ERROR_MESSAGES.workplace.createFailed), status: "error" });
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };

  const isEditMode = !isAdding && Boolean(form.admin_work_place_uuid);

  const filteredWorkPlaces = useMemo(() => {
    const keyword = search.trim();
    if (!keyword) return workPlaces;
    return workPlaces.filter((place) => place.work_place?.includes(keyword));
  }, [search, workPlaces]);

  useEffect(() => {
    if (!isOpen) return;
    if (!isAdding && !form.admin_work_place_uuid && workPlaces.length > 0) {
      setForm(toWorkPlaceForm(workPlaces[0]));
    }
  }, [form.admin_work_place_uuid, isAdding, isOpen, workPlaces]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleNew = () => {
    setIsAdding(true);
    setForm(initialRateForm);
  };

  const handleSelect = (place) => {
    setIsAdding(false);
    setForm(toWorkPlaceForm(place));
  };

  const handleClose = () => {
    if (saving || deleting || registration) return;
    setForm(initialRateForm);
    setSearch("");
    setIsAdding(false);
    onClose?.();
  };


  const handleSubmit = async () => {
    if (saving || deleting || registration) return;
    if (!form.work_place.trim()) {
      notify(toast, {
        title: ERROR_MESSAGES.workplace.nameRequired,
        status: "warning",
      });
      return;
    }

    const missingRate = RATE_FIELDS.find(
      (field) => form[field.key] === "" || form[field.key] == null
    );
    if (missingRate) {
      notify(toast, {
        title: "시급 정보를 모두 입력해주세요.",
        description: `${missingRate.label} 항목이 비어 있습니다.`,
        status: "warning",
      });
      return;
    }

    const invalidRate = RATE_FIELDS.find(
      (field) => !Number.isFinite(Number(form[field.key])) || Number(form[field.key]) < 0
    );
    if (invalidRate) {
      notify(toast, {
        title: "시급 정보를 확인해주세요.",
        description: `${invalidRate.label} 항목에는 0 이상의 숫자를 입력해주세요.`,
        status: "warning",
      });
      return;
    }

    const payload = buildWorkPlacePayload(form, isEditMode);
    if (!isEditMode) {
      setRegistration({ name: payload.work_place, place: payload });
      return;
    }
    try {
      setSaving(true);
      const result = await updateAdminWorkPlace(payload, toast);

      if (result?.success === false) {
        throw new Error(result?.message || "근무지 저장에 실패했습니다.");
      }

      notify(toast, { title: "근무지를 수정했습니다.", status: "success" });
      await onSuccess?.();
    } catch (err) {
      notify(toast, {
        title: "근무지 저장 중 오류가 발생했습니다.",
        description: getErrorMessage(
          err,
          isEditMode
            ? ERROR_MESSAGES.workplace.updateFailed
            : ERROR_MESSAGES.workplace.createFailed
        ),
        status: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!form.admin_work_place_uuid) return;

    try {
      setDeleting(true);
      const result = await deleteAdminWorkPlace(form.admin_work_place_uuid, toast);

      if (result?.success === false) {
        throw new Error(result?.message || "근무지 삭제에 실패했습니다.");
      }

      notify(toast, {
        title: "근무지를 삭제했습니다.",
        status: "success",
      });
      setIsAdding(true);
      setForm(initialRateForm);
      onSuccess?.();
    } catch (err) {
      notify(toast, {
        title: "근무지 삭제 중 오류가 발생했습니다.",
        description: getErrorMessage(err, ERROR_MESSAGES.workplace.deleteFailed),
        status: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  return {
    registration,
    cancelRegistration,
    confirmRegistration,
    deleting,
    filteredWorkPlaces,
    form,
    handleChange,
    handleClose,
    handleDelete,
    handleNew,
    handleSelect,
    handleSubmit,
    isAdding,
    isEditMode,
    saving,
    search,
    setSearch,
  };
}
