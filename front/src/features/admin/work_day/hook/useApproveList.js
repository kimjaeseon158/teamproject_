import { useState } from "react";
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
import { getAdminWorkDays } from "../api/adminWorkday";

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

      const workDays = await getAdminWorkDays(
        {
          status,
          start_date: startDate,
          end_date: endDate,
          work_place: workPlace === "__NULL__" ? "" : workPlace,
          work_shift: workType === "__NULL__" ? "" : workType,
          user_name: userName.trim(),
          extra_work: extraWork,
        },
        { toast }
      );

      const mapped = workDays
        .map((workDay, index) => {
          const day = getMinutesByType(workDay.details, "주간");
          const totalWorkMinutes = getTotalWorkMinutes(workDay.details);
          const workDurationLabel = getWorkDurationLabel(workDay.details);
          const totalWorkHM = minutesToHM(totalWorkMinutes || day);
          const baseWorkMinutes = Number(workDay.details?.[0]?.minutes) || day || totalWorkMinutes;
          const workStartHM = toTimeHM(workDay.work_start);
          const workEndHM = toTimeHM(workDay.work_end);
          const extraWorkDetails = getExtraWorkDetails(workDay.details, workStartHM, workEndHM);
          const extraWorkMinutes = extraWorkDetails.reduce(
            (total, detail) => total + (Number(detail.minutes) || 0),
            0
          );
          const totalWorkDisplay =
            extraWorkMinutes > 0
              ? `${minutesToHM(baseWorkMinutes)} + ${minutesToHM(extraWorkMinutes)}`
              : minutesToHM(baseWorkMinutes);

          return {
            id: workDay.id ?? `${workDay.user_uuid}-${index}`,
            user_uuid: workDay.user_uuid,
            name: workDay.user_name,
            date: toDateOnly(workDay.work_date),
            workShift: workDay.work_shift ?? "",
            workType: workDay.work_shift ?? workDay.details?.[0]?.work_type ?? "-",
            workTime:
              workStartHM && workEndHM
                ? `${workStartHM}~${workEndHM}`
                : "",
            location: workDay.work_place ?? "",
            dayHM: minutesToHM(baseWorkMinutes),
            totalWorkMinutes,
            totalWorkHM,
            workDuration: totalWorkHM,
            workDurationLabel,
            extraWorkDetails,
            totalWorkDisplay,
            status: deriveStatus(workDay),
          };
        })
        .sort((a, b) => String(a.date).localeCompare(String(b.date)));

      setRows(mapped);
    } catch (err) {
      toast?.({
        title: "조회 실패",
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
