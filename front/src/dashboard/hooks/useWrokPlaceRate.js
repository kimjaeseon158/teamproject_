// src/hooks/useWorkPlaceRate.js
import { useState } from "react";
import { getWorkaddPlaceList } from "../api/work_place/userWorkplace_addList";
import { getWorkPlaceList_Update } from "../api/work_place/userWorkplace_Update";
import { getWorkplaceList_Delete } from "../api/work_place/userWorkplace_Delete";

export function useWorkPlaceRate(toast) {
  const [selectedId, setSelectedId] = useState(null);

  const handleAdd = async () => {
    console.log("ADD URL 호출됨");
    await getWorkaddPlaceList(
      { base_hourly_wage: 10000 },
      toast
    );
  };

  const handleUpdate = async () => {
    console.log("UPDATE URL 호출됨");
    await getWorkPlaceList_Update(
      { rate_uuid: selectedId, base_hourly_wage: 12000 },
      toast
    );
  };

  const handleDelete = async () => {
    console.log("DELETE URL 호출됨");
    await getWorkplaceList_Delete(
      { rate_uuid: selectedId },
      toast
    );
  };

  return {
    handleAdd,
    handleUpdate,
    handleDelete,
    setSelectedId,
  };
}
