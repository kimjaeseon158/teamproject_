import { addWorkPlaceRates, createWorkPlaceRate } from "../api/userWorkplace_addList";
import { getWorkPlaceFiltering } from "../api/userWorkplaceFiltering";
import { updateWorkPlaceRate } from "../api/userWorkplace_Update";
import { deleteWorkPlaceRate } from "../api/userWorkplace_Delete";
import { buildRateRequest } from "../utils/rateHistory";

export function useWorkPlaceRate(toast) {
  const handleAdd = async (payload) =>
    await createWorkPlaceRate(
      buildRateRequest(payload, { includeUser: true }),
      toast
    );

  const handleAddMany = async (payloads) =>
    await addWorkPlaceRates(
      payloads.map((payload) => buildRateRequest(payload, { includeUser: true })),
      toast
    );

  const handleUpdate = async (payload) =>
    await updateWorkPlaceRate(payload, { toast });

  const handleDelete = async ({ rate_uuid }) => {
    if (!rate_uuid) return null;
    return await deleteWorkPlaceRate({ rate_uuid }, toast);
  };

  const handleFiltering = async ({ user_name, work_place }) =>
    await getWorkPlaceFiltering({ user_name, work_place }, toast);

  return {
    handleAdd,
    handleAddMany,
    handleUpdate,
    handleDelete,
    handleFiltering,
  };
}
