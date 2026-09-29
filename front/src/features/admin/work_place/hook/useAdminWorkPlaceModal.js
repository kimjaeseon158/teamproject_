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
  const [initialForm, setInitialForm] = useState(initialRateForm);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [registration, setRegistration] = useState(null);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);
  const submitting = useRef(false);
  const pendingDiscardAction = useRef(null);

  const isDirty = Object.keys(initialRateForm).some(
    (key) => String(form[key] ?? "") !== String(initialForm[key] ?? "")
  );

  const runWithDiscardCheck = (action) => {
    if (!isDirty) return action();
    pendingDiscardAction.current = action;
    setDiscardConfirmOpen(true);
  };

  const cancelDiscard = () => {
    pendingDiscardAction.current = null;
    setDiscardConfirmOpen(false);
  };

  const confirmDiscard = () => {
    const action = pendingDiscardAction.current;
    pendingDiscardAction.current = null;
    setDiscardConfirmOpen(false);
    action?.();
  };
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
      const savedForm = toWorkPlaceForm(result?.work_places?.[0] || workPlaces[0]);
      setForm(savedForm);
      setInitialForm(savedForm);
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
    if (workPlaces.length === 0 && !isAdding) {
      setIsAdding(true);
      setForm(initialRateForm);
      setInitialForm(initialRateForm);
      return;
    }
    if (!isAdding && !form.admin_work_place_uuid && workPlaces.length > 0) {
      const nextForm = toWorkPlaceForm(workPlaces[0]);
      setForm(nextForm);
      setInitialForm(nextForm);
    }
  }, [form.admin_work_place_uuid, isAdding, isOpen, workPlaces]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleNew = () => {
    if (isAdding) return;
    runWithDiscardCheck(() => {
      setIsAdding(true);
      setForm(initialRateForm);
      setInitialForm(initialRateForm);
    });
  };

  const handleSelect = (place) => {
    if (place.admin_work_place_uuid === form.admin_work_place_uuid) return;
    runWithDiscardCheck(() => {
      const nextForm = toWorkPlaceForm(place);
      setIsAdding(false);
      setForm(nextForm);
      setInitialForm(nextForm);
    });
  };

  const handleClose = () => {
    if (saving || deleting || registration) return;
    if (isDirty) {
      pendingDiscardAction.current = () => {
        if (isAdding && workPlaces.length > 0) {
          const firstForm = toWorkPlaceForm(workPlaces[0]);
          setIsAdding(false);
          setForm(firstForm);
          setInitialForm(firstForm);
          return;
        }
        setForm(initialForm);
      };
      setDiscardConfirmOpen(true);
      return;
    }
    setForm(initialRateForm);
    setInitialForm(initialRateForm);
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

    const normalizedName = form.work_place.trim().replace(/\s+/g, " ").toLowerCase();
    const duplicate = workPlaces.some((place) =>
      place.admin_work_place_uuid !== form.admin_work_place_uuid
      && place.work_place?.trim().replace(/\s+/g, " ").toLowerCase() === normalizedName
    );
    if (duplicate) {
      notify(toast, { title: "이미 등록된 근무지명입니다.", status: "warning" });
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

    const decimalRate = RATE_FIELDS.find(
      (field) => !Number.isInteger(Number(form[field.key]))
    );
    if (decimalRate) {
      notify(toast, {
        title: "시급은 정수로 입력해주세요.",
        description: `${decimalRate.label} 항목에는 소수점을 사용할 수 없습니다.`,
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
      const savedForm = { ...form, work_place: form.work_place.trim() };
      setForm(savedForm);
      setInitialForm(savedForm);
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
      const remainingWorkPlaces = workPlaces.filter(
        (place) => place.admin_work_place_uuid !== form.admin_work_place_uuid
      );
      if (remainingWorkPlaces.length > 0) {
        const firstForm = toWorkPlaceForm(remainingWorkPlaces[0]);
        setIsAdding(false);
        setForm(firstForm);
        setInitialForm(firstForm);
      } else {
        setIsAdding(true);
        setForm(initialRateForm);
        setInitialForm(initialRateForm);
      }
      await onSuccess?.();
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
    cancelDiscard,
    confirmRegistration,
    confirmDiscard,
    deleting,
    discardConfirmOpen,
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
