import { fetchWithAuth } from "../../../services/api/fetchWithAuth";

export const fetchUserMonthlySummary = async (date, { toast } = {}) => {
  const res = await fetchWithAuth(
    `/api/user-monthly-work-summary/?date=${date}`,
    {},
    { toast }
  );

  if (!res || !res.ok) {
    throw new Error("월간 근무 정보를 가져오지 못했습니다.");
  }

  return res.json();
};
