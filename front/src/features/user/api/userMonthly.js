import { ApiGet } from "../../../services/api/requestJson";
import { toQueryString } from "../../../services/api/requestJson";

export const fetchUserMonthlySummary = async (date, { toast } = {}) => {
  const data = await ApiGet(
    `/api/user-monthly-work-summary/${toQueryString({ date })}`,
    { toast }
  );

  if (!data) {
    throw new Error("월간 근무 정보를 가져오지 못했습니다.");
  }

  return data;
};
