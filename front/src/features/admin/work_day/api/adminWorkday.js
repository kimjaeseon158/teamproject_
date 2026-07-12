import { ApiGet, toQueryString } from "../../../../services/api/requestJson";

export async function getAdminWorkDays(
  {
    status,
    start_date,
    end_date,
    start_date_str,
    end_date_str,
    work_place,
    work_shift,
    user_name,
    extra_work,
  } = {},
  { toast } = {}
) {
  const startDate = start_date_str ?? start_date;
  const endDate = end_date_str ?? end_date;

  const json = await ApiGet(
    `/api/admin-page-workday/${toQueryString({
      status,
      start_date: startDate,
      start_date_str: startDate,
      end_date: endDate,
      end_date_str: endDate,
      work_place,
      work_shift,
      user_name,
      extra_work,
    })}`,
    { toast }
  );

  return json?.data || [];
}
