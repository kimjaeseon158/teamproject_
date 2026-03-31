import { useState } from "react";
import { fetchWithAuth } from "../../../../services/api/fetchWithAuth";
import { API_BASE } from "../../../../config/api/apiEnv";
import {
  minutesToHM,
  getMinutesByType,
  toDateOnly,
  toTimeHM,
  deriveStatus,
} from "../utils/approveUtils";

export function useApproveList(toast) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchList = async ({ status, startDate, endDate }) => {
    try {
      setLoading(true);

      const qs = new URLSearchParams({
        status,
        start_date: startDate,
        end_date: endDate,
      }).toString();

      const res = await fetchWithAuth(`${API_BASE}/api/admin_page_workday/?${qs}`, {}, { toast });
      const json = await res.json();

      const mapped = (json.data || []).map((w, idx) => {
        const day = getMinutesByType(w.details, "주간");
        const overtime = getMinutesByType(w.details, "잔업");
        const lunch = getMinutesByType(w.details, "중식");

        return {
          id: w.id ?? `${w.user_uuid}-${idx}`,
          user_uuid: w.user_uuid,
          name: w.user_name,
          date: toDateOnly(w.work_date),
          workType: w.details?.[0]?.work_type ?? "-",
          workTime:
            toTimeHM(w.work_start) && toTimeHM(w.work_end)
              ? `${toTimeHM(w.work_start)}~${toTimeHM(w.work_end)}`
              : "",
          location: w.work_place ?? "",
          dayHM: minutesToHM(day),
          overtimeDuration: minutesToHM(overtime),
          lunchDuration: minutesToHM(lunch),
          overtimeChecked: overtime > 0,
          lunchChecked: lunch > 0,
          status: deriveStatus(w),
        };
      });

      setRows(mapped);
    } catch {
      toast({ title: "조회 실패", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  return { rows, loading, fetchList };
}
