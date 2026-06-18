// src/api/adminWorkday.js
import { fetchWithAuth } from "../../../../services/api/fetchWithAuth";

export async function getAdminWorkDays(
  { status, start_date, end_date, start_date_str, end_date_str } = {},
  { toast } = {}
) {
  const qs = new URLSearchParams();
  const startDate = start_date_str ?? start_date;
  const endDate = end_date_str ?? end_date;

  if (status) qs.set("status", status);
  if (startDate) {
    qs.set("start_date", startDate);
    qs.set("start_date_str", startDate);
  }
  if (endDate) {
    qs.set("end_date", endDate);
    qs.set("end_date_str", endDate);
  }

  const url = qs.toString()
    ? `/api/admin_page_workday/?${qs.toString()}`
    : "/api/admin_page_workday/";

  const res = await fetchWithAuth(url, { method: "GET" }, { toast });

  if (!res.ok) {
    let msg = "근무내역 조회 실패";
    try {
      const err = await res.json();
      msg = err.detail || JSON.stringify(err);
    } catch {}
    throw new Error(msg);
  }

  const json = await res.json().catch(() => ({}));
  return json?.data || [];
}
