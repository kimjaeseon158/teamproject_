// src/hooks/useWorkPlaceRate.js

import { getWorkaddPlaceList } from "../api/userWorkplace_addList";
import { getWorkPlaceList_Update } from "../api/userWorkplace_Update";
import { getWorkplaceList_Delete } from "../api/userWorkplace_Delete";
import { getWorkPlaceFiltering } from "../api/userWorkplaceFiltering";

export function useWorkPlaceRate(toast) {

  /* ======================
     ADD (data 배열 구조)
  ====================== */
const handleAdd = async (payload) => {

  return await getWorkaddPlaceList(
    {
      user_uuid: payload.user_uuid,
      work_place: payload.work_place,
      base_hourly_wage: payload.base_hourly_wage ?? null,
      overtime_hourly_wage: payload.overtime_hourly_wage ?? null,
      meal_ot_hourly_wage: payload.meal_ot_hourly_wage ?? null,
      special_hourly_wage: payload.special_hourly_wage ?? null,
      overnight_hourly_wage: payload.overnight_hourly_wage ?? null,
      overnight_ot_hourly_wage: payload.overnight_ot_hourly_wage ?? null,
    },
    toast
  );
};

  /* ======================
     UPDATE (flat)
  ====================== */
  const handleUpdate = async (payload) => {
    return await getWorkPlaceList_Update(payload, toast);
  };

  /* ======================
     DELETE (flat + reset)
  ====================== */
  const handleDelete = async ({ user, rate_uuid }) => {

    if (!rate_uuid) return;

    // 마지막 1개면 reset
    if (user.rates.length === 1) {
      const rate = user.rates[0];

      return await getWorkPlaceList_Update({
        rate_uuid: rate.rate_uuid,
        work_place: "미지정",
        base_hourly_wage: null,
        overtime_hourly_wage: null,
        meal_ot_hourly_wage: null,
        special_hourly_wage: null,
        overnight_hourly_wage: null,
        overnight_ot_hourly_wage: null,
      }, toast);
    }

    return await getWorkplaceList_Delete(
      { rate_uuid },
      toast
    );
  };
 /* ======================
     Filtering 
  ====================== */
  const handleFiltering = async ({ user_name, work_place }) => {

    return await getWorkPlaceFiltering(
      {
        user_name,
        work_place,
      },
      toast
    );
  };

  return {
    handleAdd,
    handleUpdate,
    handleDelete,
    handleFiltering,
  };
}