import useRateEditActions from "./useRateEditActions";
import useRateEditPlaces from "./useRateEditPlaces";
import useRateEditRowsState from "./useRateEditRowsState";
import useRateEditSummary from "./useRateEditSummary";
import { EMPTY_PLACE } from "../constants/rateFields";

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
  const registeredRows = rows.tableData.filter(
    (row) => row.work_place && row.work_place !== EMPTY_PLACE
  );
  const usedPlaceUuids = new Set(
    registeredRows.map((row) => row.admin_work_place_uuid).filter(Boolean)
  );
  const usedPlaceNames = new Set(registeredRows.map((row) => row.work_place));
  const realAdminWorkPlaces = adminWorkPlaces.filter(
    (place) =>
      place.work_place &&
      place.work_place !== EMPTY_PLACE
  );
  const availableWorkPlaces = realAdminWorkPlaces.filter(
    (place) =>
      !usedPlaceUuids.has(place.admin_work_place_uuid) &&
      !usedPlaceNames.has(place.work_place)
  );
  const canAddRow = registeredRows.length > 0 && realAdminWorkPlaces.length > 0;
  const hasAvailableWorkPlace = availableWorkPlaces.length > 0;
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
    setTempRates: rows.setTempRates,
    updateTempRate: rows.updateTempRate,
    summary,
    tableData: rows.tableData,
  };
}
