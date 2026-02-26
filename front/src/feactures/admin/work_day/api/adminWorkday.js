// src/api/adminWorkday.js
import { fetchWithAuth } from "./fetchWithAuth";

export async function getAdminWorkDays(
  { status, start_date, end_date } = {},
  { toast } = {}
) {
  const qs = new URLSearchParams();
  if (status) qs.set("status", status);
  if (start_date) qs.set("start_date", start_date);
  if (end_date) qs.set("end_date", end_date);

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
  return json?.work_days || [];
}
