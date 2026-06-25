import { useState } from "react";
import { fetchWithAuth } from "../../../../services/api/fetchWithAuth";
import {
  minutesToHM,
  getMinutesByType,
  getTotalWorkMinutes,
  getWorkDurationLabel,
  toDateOnly,
  toTimeHM,
  deriveStatus,
} from "../utils/approveUtils";
import { addMinutesToTime } from "../../../common/workTimeUtils";
import { EXTRA_WORK_TYPES, getExtraWorkTypeByLabel } from "../../../common/workTypes";

const getExtraWorkTimeRange = (type, minutes, workStartHM, workEndHM) => {
  if (type === "lunch_ext") {
    const lunchEndHM = addMinutesToTime("12:00", minutes);
    return lunchEndHM ? `12:00~${lunchEndHM}` : "";
  }

  if (type === "early_arrival") {
    const earlyStartHM = addMinutesToTime(workStartHM, -minutes);
    return workStartHM && earlyStartHM ? `${earlyStartHM}~${workStartHM}` : "";
  }

  const extraEndHM = addMinutesToTime(workEndHM, minutes);
  return workEndHM && extraEndHM ? `${workEndHM}~${extraEndHM}` : "";
};

const getExtraWorkDetails = (details = [], workStartHM, workEndHM) => {
  const extraRows = details.slice(1);

  return EXTRA_WORK_TYPES.map((type) => {
    const minutes = extraRows
      .filter((detail) => getExtraWorkTypeByLabel(detail.work_type)?.value === type.value)
      .reduce((total, detail) => total + (Number(detail.minutes) || 0), 0);

    if (minutes <= 0) return null;

    return {
      type: type.value,
      label: type.label,
      time: getExtraWorkTimeRange(type.value, minutes, workStartHM, workEndHM),
      duration: minutesToHM(minutes),
      minutes,
    };
  }).filter(Boolean);
};

export function useApproveList(toast) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchList = async ({
    status,
    startDate,
    endDate,
    workPlace = "",
    workType = "",
    userName = "",
    extraWork = "",
  }) => {
    try {
      setLoading(true);

      const qs = new URLSearchParams();

      if (status) qs.set("status", status);
      if (startDate) {
        qs.set("start_date", startDate);
        qs.set("start_date_str", startDate);
      }
      if (endDate) {
        qs.set("end_date", endDate);
        qs.set("end_date_str", endDate);
      }
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
      if (userName.trim()) qs.set("user_name", userName.trim());
      if (extraWork) qs.set("extra_work", extraWork);

      const res = await fetchWithAuth(
        `/api/admin-page-workday/?${qs.toString()}`,
        {},
        { toast }
      );

      if (!res) {
        throw new Error("?�증??만료?�었?�니?? ?�시 로그?�해주세??");
      }

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          json.detail || json.message || "?�인 목록 조회???�패?�습?�다."
        );
      }

      const mapped = (json.data || [])
        .map((w, idx) => {
          const day = getMinutesByType(w.details, "주간");
          const totalWorkMinutes = getTotalWorkMinutes(w.details);
          const workDurationLabel = getWorkDurationLabel(w.details);
          const totalWorkHM = minutesToHM(totalWorkMinutes || day);
          const baseWorkMinutes = Number(w.details?.[0]?.minutes) || day || totalWorkMinutes;
          const workStartHM = toTimeHM(w.work_start);
          const workEndHM = toTimeHM(w.work_end);
          const extraWorkDetails = getExtraWorkDetails(w.details, workStartHM, workEndHM);
          const extraWorkMinutes = extraWorkDetails.reduce(
            (total, detail) => total + (Number(detail.minutes) || 0),
            0
          );
          const totalWorkDisplay =
            extraWorkMinutes > 0
              ? `${minutesToHM(baseWorkMinutes)} + ${minutesToHM(extraWorkMinutes)}`
              : minutesToHM(baseWorkMinutes);

          return {
            id: w.id ?? `${w.user_uuid}-${idx}`,
            user_uuid: w.user_uuid,
            name: w.user_name,
            date: toDateOnly(w.work_date),
            workShift: w.work_shift ?? "",
            workType: w.work_shift ?? w.details?.[0]?.work_type ?? "-",
            workTime:
              workStartHM && workEndHM
                ? `${workStartHM}~${workEndHM}`
                : "",
            location: w.work_place ?? "",
            dayHM: minutesToHM(baseWorkMinutes),
            totalWorkMinutes,
            totalWorkHM,
            workDuration: totalWorkHM,
            workDurationLabel,
            extraWorkDetails,
            totalWorkDisplay,
            status: deriveStatus(w),
          };
        })
        .sort((a, b) => String(a.date).localeCompare(String(b.date)));

      setRows(mapped);
    } catch (err) {
      toast?.({
        title: "조회 ?�패",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return { rows, loading, fetchList };
}
