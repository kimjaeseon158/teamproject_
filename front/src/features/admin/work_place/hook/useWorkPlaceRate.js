import { EMPTY_PLACE, RATE_FIELDS } from "../constants/rateFields";
import { getWorkaddPlaceList } from "../api/userWorkplace_addList";
import { getWorkPlaceFiltering } from "../api/userWorkplaceFiltering";
import { getWorkPlaceList_Update } from "../api/userWorkplace_Update";
import { getWorkplaceList_Delete } from "../api/userWorkplace_Delete";

const buildEmptyRatePayload = (rateUuid) => ({
  rate_uuid: rateUuid,
  work_place: EMPTY_PLACE,
  ...RATE_FIELDS.reduce((payload, field) => {
    payload[field.key] = null;
    return payload;
  }, {}),
});

export function useWorkPlaceRate(toast) {
  const handleAdd = async (payload) =>
    await getWorkaddPlaceList(
      {
        user_uuid: payload.user_uuid,
        admin_work_place_uuid: payload.admin_work_place_uuid,
        work_place: payload.work_place,
        ...RATE_FIELDS.reduce((next, field) => {
          next[field.key] = payload[field.key] ?? null;
          return next;
        }, {}),
      },
      toast
    );

  const handleUpdate = async (payload) =>
    await getWorkPlaceList_Update(payload, { toast });

  const handleDelete = async ({ user, rate_uuid }) => {
    if (!rate_uuid) return null;

    if (user.rates.length === 1) {
      const rate = user.rates[0];
      return await getWorkPlaceList_Update(
        buildEmptyRatePayload(rate.rate_uuid),
        { toast }
      );
    }

    return await getWorkplaceList_Delete({ rate_uuid }, toast);
  };

  const handleFiltering = async ({ user_name, work_place }) =>
    await getWorkPlaceFiltering({ user_name, work_place }, toast);

  return {
    handleAdd,
    handleUpdate,
    handleDelete,
    handleFiltering,
  };
}
