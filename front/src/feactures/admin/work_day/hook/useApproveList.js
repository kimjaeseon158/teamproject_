import { useState } from "react";
import { fetchWithAuth } from "../../../../services/api/fetchWithAuth";
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

  const fetchList = async ({
    status,
    startDate,
    endDate,
    workPlace = "",
    workType = "",
  }) => {
    try {
      setLoading(true);

      const qs = new URLSearchParams();

      if (status) qs.set("status", status);
      if (startDate) qs.set("start_date", startDate);
      if (endDate) qs.set("end_date", endDate);
      if (workPlace === "__NULL__") {
        qs.set("work_place_isnull", "true");
      } else if (workPlace) {
        qs.set("work_place", workPlace);
      }
      if (workType === "__NULL__") {
        qs.set("work_shift_isnull", "true");
      } else if (workType) {
        qs.set("work_shift", workType);
      }

      const res = await fetchWithAuth(
        `/api/admin_page_workday/?${qs.toString()}`,
        {},
        { toast }
      );
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
