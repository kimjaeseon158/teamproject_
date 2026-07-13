import useRateEditActions from "./useRateEditActions";
import useRateEditPlaces from "./useRateEditPlaces";
import useRateEditRowsState from "./useRateEditRowsState";
import useRateEditSummary from "./useRateEditSummary";

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
  const actions = useRateEditActions({
    onClose,
    onSuccess,
    rows,
    toast,
    user,
  });

  return {
    adminWorkPlaces,
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
    setTempRates: rows.setTempRates,
    summary,
    tableData: rows.tableData,
  };
}
