import { useEffect, useMemo, useState } from "react";

import { RATE_FIELDS, initialRateForm } from "../constants/rateFields";
import { notify, toNumberOrNull } from "../utils/rateFormat";
import {
  createAdminWorkPlace,
  deleteAdminWorkPlace,
  updateAdminWorkPlace,
} from "../api/adminWorkPlace";

const toForm = (place = {}) => ({
  ...initialRateForm,
  ...Object.keys(initialRateForm).reduce((next, key) => {
    next[key] = place[key] ?? "";
    return next;
  }, {}),
});

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

  const isEditMode = !isAdding && Boolean(form.admin_work_place_uuid);

  const filteredWorkPlaces = useMemo(() => {
    const keyword = search.trim();
    if (!keyword) return workPlaces;
    return workPlaces.filter((place) => place.work_place?.includes(keyword));
  }, [search, workPlaces]);

  useEffect(() => {
    if (!isOpen) return;
    if (!isAdding && !form.admin_work_place_uuid && workPlaces.length > 0) {
      setForm(toForm(workPlaces[0]));
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
    setForm(toForm(place));
  };

  const handleClose = () => {
    if (saving || deleting) return;
    setForm(initialRateForm);
    setSearch("");
    setIsAdding(false);
    onClose?.();
  };

  const buildPayload = () => ({
    ...(isEditMode ? { admin_work_place_uuid: form.admin_work_place_uuid } : {}),
    work_place: form.work_place.trim(),
    ...RATE_FIELDS.reduce((next, field) => {
      next[field.key] = toNumberOrNull(form[field.key]);
      return next;
    }, {}),
  });

  const handleSubmit = async () => {
    if (!form.work_place.trim()) {
      notify(toast, {
        title: "근무지명을 입력해주세요.",
        status: "warning",
      });
      return;
    }

    try {
      setSaving(true);
      const result = isEditMode
        ? await updateAdminWorkPlace(buildPayload(), toast)
        : await createAdminWorkPlace(buildPayload(), toast);

      if (result?.success === false) {
        throw new Error(result?.message || "근무지 저장에 실패했습니다.");
      }

      notify(toast, {
        title: isEditMode ? "근무지를 수정했습니다." : "근무지를 등록했습니다.",
        status: "success",
      });
      onSuccess?.();
      if (!isEditMode) {
        setIsAdding(true);
        setForm(initialRateForm);
      }
    } catch (err) {
      notify(toast, {
        title: "근무지 저장 중 오류가 발생했습니다.",
        description: err?.message,
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
        description: err?.message,
        status: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  return {
    deleting,
    filteredWorkPlaces,
    form,
    handleChange,
    handleClose,
    handleDelete,
    handleNew,
    handleSelect,
    handleSubmit,
    isEditMode,
    saving,
    search,
    setSearch,
  };
}
