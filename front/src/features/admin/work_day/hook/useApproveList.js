import { useState } from "react";
import {
  minutesToHM,
  getMinutesByType,
  getTotalWorkMinutes,
  getWorkDurationLabel,
  getDisplayWorkType,
  toDateOnly,
  toTimeHM,
  deriveStatus,
} from "../utils/approveUtils";
import { addMinutesToTime } from "../../../common/workTimeUtils";
import { EXTRA_WORK_TYPES, getExtraWorkTypeByLabel } from "../../../common/workTypes";
import { getAdminWorkDays } from "../api/adminWorkday";

const SPECIAL_WORK_SHIFT_MAP = {
  "주간 특근": { workShift: "주간", extraWork: "주간 특근" },
  "야간 특근": { workShift: "야간", extraWork: "야간 특근" },
};

const getWorkFilterPayload = (workType, extraWork) => {
  const specialFilter = SPECIAL_WORK_SHIFT_MAP[workType];
  if (!specialFilter) {
    return {
      work_shift: workType,
      extra_work: extraWork,
    };
  }

  return {
    work_shift: specialFilter.workShift,
    extra_work: specialFilter.extraWork,
  };
};

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
      const workFilters = getWorkFilterPayload(workType, extraWork);

      const workDays = await getAdminWorkDays(
        {
          status,
          start_date: startDate,
          end_date: endDate,
          work_place: workPlace === "__NULL__" ? "" : workPlace,
          work_shift: workFilters.work_shift,
          user_name: userName.trim(),
          extra_work: workFilters.extra_work,
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
            workType: getDisplayWorkType(workDay),
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
