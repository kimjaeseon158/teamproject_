import { useState } from "react";

import { EMPTY_PLACE, RATE_FIELDS, initialRateForm } from "../constants/rateFields";
import { notify } from "../utils/rateFormat";
import { useWorkPlaceRate } from "./useWorkPlaceRate";

const toRatePayload = (values) => {
  const { isNew, user_uuid, rate_uuid, ...payload } = values;
  return payload;
};

export default function useRateEditActions({
  onClose,
  onSuccess,
  rows,
  toast,
  user,
}) {
  const { handleAddMany, handleUpdate, handleDelete } = useWorkPlaceRate(toast);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleAddRow = () => {
    const { setCheckedItems, setTempRates } = rows;

    const newRow = {
      rate_uuid: `temp-${Date.now()}`,
      ...initialRateForm,
      isNew: true,
    };

    setTempRates((prev) => [...prev, newRow]);
    setCheckedItems({ [newRow.rate_uuid]: true });
    notify(toast, {
      title: "근무지 입력 행을 추가했습니다.",
      description: "근무지와 시급 정보를 입력한 뒤 저장해주세요.",
      status: "info",
    });
  };

  const handleDeleteClick = async () => {
    const { selectedId, selectedRow, setCheckedItems, setEditedValues, setEditingId, setTempRates, tableData } = rows;
    if (!selectedId) {
      notify(toast, {
        title: "삭제할 근무지를 선택해주세요.",
        status: "warning",
      });
      return;
    }

    if (selectedRow?.isNew) {
      setTempRates((prev) => prev.filter((row) => row.rate_uuid !== selectedId));
      setEditingId(null);
      setEditedValues({});
      setCheckedItems({});
      notify(toast, {
        title: "추가 중인 행을 취소했습니다.",
        status: "info",
      });
      return;
    }

    if (!selectedRow?.work_place || selectedRow.work_place === EMPTY_PLACE) {
      notify(toast, {
        title: "미지정 근무지는 삭제할 수 없습니다.",
        status: "warning",
      });
      return;
    }

    try {
      setDeleting(true);

      let result;
      if (tableData.length <= 1) {
        result = await handleUpdate({
          rate_uuid: selectedId,
          work_place: EMPTY_PLACE,
          ...RATE_FIELDS.reduce((payload, field) => {
            payload[field.key] = null;
            return payload;
          }, {}),
        });
      } else {
        result = await handleDelete({ user, rate_uuid: selectedId });
      }

      if (result?.success === false) {
        throw new Error(result?.message || "근무지 삭제에 실패했습니다.");
      }

      notify(toast, {
        title:
          tableData.length <= 1
            ? "마지막 근무지를 미지정으로 초기화했습니다."
            : "근무지를 삭제했습니다.",
        status: "success",
      });
      setCheckedItems({});
      onSuccess?.();
    } catch (err) {
      notify(toast, {
        title: "삭제 중 오류가 발생했습니다.",
        description: err?.message,
        status: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveClick = async () => {
    const { editedValues, editingId, resetEditState, tableData, tempRates } = rows;
    if (!editingId && tempRates.length === 0) {
      notify(toast, {
        title: "수정할 항목을 선택해주세요.",
        status: "warning",
      });
      return;
    }

    const existingEdit = editingId
      ? { ...tableData.find((row) => row.rate_uuid === editingId), ...editedValues }
      : null;
    const pendingRows = [...tempRates, ...(existingEdit ? [existingEdit] : [])];
    const missingPlace = pendingRows.find(
      (row) => !row.work_place || row.work_place === EMPTY_PLACE
    );
    if (missingPlace) {
      notify(toast, {
        title: "근무지를 선택해주세요.",
        status: "warning",
      });
      return;
    }

    const visibleRateFields = RATE_FIELDS.filter(
      (field) => field.key !== "special_hourly_wage"
    );
    const invalidRow = pendingRows.find((row) =>
      visibleRateFields.some(
        (field) =>
          row[field.key] === "" ||
          row[field.key] == null ||
          !Number.isFinite(Number(row[field.key])) ||
          Number(row[field.key]) < 0
      )
    );
    if (invalidRow) {
      notify(toast, {
        title: "시급 정보를 모두 입력해주세요.",
        description: "모든 시급 항목에는 0 이상의 숫자가 필요합니다.",
        status: "warning",
      });
      return;
    }

    try {
      setSaving(true);
      let result;
      if (tempRates.length > 0) {
        result = await handleAddMany(
          tempRates.map((row) => ({
            user_uuid: user.user_uuid,
            ...toRatePayload(row),
          }))
        );
      }
      if (existingEdit) {
        result = await handleUpdate({
          rate_uuid: editingId,
          ...toRatePayload(existingEdit),
        });
      }

      if (result?.success === false) {
        throw new Error(result?.message || "저장에 실패했습니다.");
      }

      notify(toast, {
        title: tempRates.length > 0
          ? `${tempRates.length}개 근무지 시급을 저장했습니다.`
          : "근무지 시급을 수정했습니다.",
        status: "success",
      });
      resetEditState();
      onSuccess?.();
      onClose?.();
    } catch (err) {
      notify(toast, {
        title: "저장 중 오류가 발생했습니다.",
        description: err?.message,
        status: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return {
    deleting,
    handleAddRow,
    handleDeleteClick,
    handleSaveClick,
    saving,
  };
}
