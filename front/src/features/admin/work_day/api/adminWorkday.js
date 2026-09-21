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
    page = 1,
    page_size = 10,
    ordering = "-work_date",
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
      page,
      page_size,
      ordering,
    })}`,
    { toast }
  );

  return {
    data: Array.isArray(json?.data) ? json.data : [],
    pagination: json?.pagination || {
      page,
      page_size,
      total_count: 0,
      total_pages: 1,
    },
    summary: json?.summary || {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      day: 0,
      night: 0,
      special: 0,
    },
  };
}
