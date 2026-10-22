import useRateEditActions from "./useRateEditActions";
import useRateEditPlaces from "./useRateEditPlaces";
import useRateEditRowsState from "./useRateEditRowsState";
import useRateEditSummary from "./useRateEditSummary";
import { EMPTY_PLACE } from "../constants/rateFields";
import { isCurrentRateHistory } from "../utils/rateHistory";

export default function useRateEditModal({
  isOpen,
  user,
  onClose,
  onSuccess,
  initialAdminWorkPlaces,
  toast,
}) {
  const adminWorkPlaces = useRateEditPlaces({
    initialAdminWorkPlaces,
    isOpen,
    toast,
  });
  const rows = useRateEditRowsState(user);
  const summary = useRateEditSummary(rows.tableData);
  const realAdminWorkPlaces = adminWorkPlaces.filter(
    (place) =>
      place.work_place &&
      place.work_place !== EMPTY_PLACE
  );
  const hasSavedCurrentRate = rows.tableData.some(
    (row) =>
      !row.isNew &&
      isCurrentRateHistory(row) &&
      row.work_place &&
      row.work_place !== EMPTY_PLACE
  );
  const canAddRow = hasSavedCurrentRate && realAdminWorkPlaces.length > 0;
  const hasAvailableWorkPlace = realAdminWorkPlaces.length > 0;
  const actions = useRateEditActions({
    canAddRow,
    hasAvailableWorkPlace,
    onClose,
    onSuccess,
    rows,
    toast,
    user,
  });

  return {
    adminWorkPlaces,
    canAddRow,
    checkedItems: rows.checkedItems,
    deleting: actions.deleting,
    editedValues: rows.editedValues,
    editingId: rows.editingId,
    handleAddRow: actions.handleAddRow,
    handleCheckboxChange: rows.handleCheckboxChange,
    handleDeleteClick: actions.handleDeleteClick,
    handleSaveClick: actions.handleSaveClick,
    saving: actions.saving,
    setEditedValues: rows.setEditedValues,
    setEditingId: rows.setEditingId,
    setCheckedItems: rows.setCheckedItems,
    setTempRates: rows.setTempRates,
    updateTempRate: rows.updateTempRate,
    summary,
    tableData: rows.tableData,
  };
}
