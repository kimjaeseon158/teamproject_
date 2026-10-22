import { useState } from "react";

import { EMPTY_PLACE, RATE_FIELDS, initialRateForm } from "../constants/rateFields";
import { notify } from "../utils/rateFormat";
import {
  buildRateRequest,
  getRateApiErrorMessage,
  getRateValidationMessage,
} from "../utils/rateHistory";
import { useWorkPlaceRate } from "./useWorkPlaceRate";

const toRatePayload = (values) => {
  return buildRateRequest(values);
};

export default function useRateEditActions({
  canAddRow,
  hasAvailableWorkPlace,
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

    if (!canAddRow) {
      notify(toast, {
        title: "추가 가능한 근무지가 없습니다.",
        description: "미지정 근무지를 실제 근무지로 먼저 수정하거나 등록되지 않은 근무지를 확인해주세요.",
        status: "warning",
      });
      return;
    }
    if (!hasAvailableWorkPlace) {
      notify(toast, {
        title: "추가 가능한 근무지가 없습니다.",
        description: "이미 등록된 근무지를 제외하면 선택할 수 있는 근무지가 없습니다.",
        status: "info",
      });
      return;
    }

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
    const { selectedId, selectedRow, setCheckedItems, setEditedValues, setEditingId, setTempRates } = rows;
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

    if (selectedRow?.can_delete === false || selectedRow?.used_for_approval) {
      notify(toast, {
        title: "이 단가 이력은 삭제할 수 없습니다.",
        description:
          selectedRow.delete_block_reason || "승인에 사용된 단가 이력입니다.",
        status: "warning",
      });
      return;
    }

    try {
      setDeleting(true);

      const result = await handleDelete({ rate_uuid: selectedId });

      if (result?.success === false) {
        throw new Error(getRateApiErrorMessage(result, "단가 이력 삭제에 실패했습니다."));
      }

      notify(toast, {
        title: "단가 이력을 삭제했습니다.",
        status: "success",
      });
      setCheckedItems({});
      onSuccess?.();
    } catch (err) {
      notify(toast, {
        title: "삭제 중 오류가 발생했습니다.",
        description: getRateApiErrorMessage(err, "단가 이력을 삭제하지 못했습니다."),
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

    const periodError = getRateValidationMessage(pendingRows);
    if (periodError) {
      notify(toast, { title: periodError, status: "warning" });
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
        throw new Error(getRateApiErrorMessage(result, "저장에 실패했습니다."));
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
        description: getRateApiErrorMessage(err, "단가 이력을 저장하지 못했습니다."),
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
