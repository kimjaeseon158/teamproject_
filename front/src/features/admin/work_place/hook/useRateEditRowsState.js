import { useMemo, useState } from "react";

export default function useRateEditRowsState(user) {
  const [editingId, setEditingId] = useState(null);
  const [editedValues, setEditedValues] = useState({});
  const [checkedItems, setCheckedItems] = useState({});
  const [tempRates, setTempRates] = useState([]);

  const tableData = useMemo(
    () => [...(user?.rates || []), ...tempRates],
    [user?.rates, tempRates]
  );

  const selectedId = Object.keys(checkedItems).find((id) => checkedItems[id]);
  const selectedRow = tableData.find((row) => row.rate_uuid === selectedId);

  const handleCheckboxChange = (rateUuid) => {
    setCheckedItems((prev) => ({ [rateUuid]: !prev[rateUuid] }));
  };

  const resetEditState = () => {
    setEditingId(null);
    setEditedValues({});
    setTempRates([]);
    setCheckedItems({});
  };

  return {
    checkedItems,
    editedValues,
    editingId,
    handleCheckboxChange,
    resetEditState,
    selectedId,
    selectedRow,
    setCheckedItems,
    setEditedValues,
    setEditingId,
    setTempRates,
    tableData,
    tempRates,
  };
}
