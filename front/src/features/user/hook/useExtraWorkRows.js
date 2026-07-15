import { useEffect, useMemo, useState } from "react";

import { getExtraWorkTimes } from "../../common/workTimeUtils";
import { diffMinutes, minutesToHM } from "../utils/timeUtils";

const createExtraWorkRow = (type = "weekday_ot", startTime = "", finishTime = "") => {
  const times = getExtraWorkTimes(type, startTime, finishTime);
  return {
    type,
    ...times,
    duration: minutesToHM(diffMinutes(times.start, times.finish)),
  };
};

export default function useExtraWorkRows({ finishTime, startTime }) {
  const [extraEnabled, setExtraEnabled] = useState(false);
  const [extraWorks, setExtraWorks] = useState([]);

  useEffect(() => {
    if (extraEnabled && extraWorks.length === 0) {
      setExtraWorks([createExtraWorkRow("weekday_ot", startTime, finishTime)]);
    }
    if (!extraEnabled && extraWorks.length > 0) {
      setExtraWorks([]);
    }
  }, [extraEnabled, extraWorks.length, startTime, finishTime]);

  useEffect(() => {
    if (!extraEnabled || extraWorks.length === 0) return;

    setExtraWorks((prev) =>
      prev.map((row) => {
        const type = row.type || "weekday_ot";
        const times = getExtraWorkTimes(type, startTime, finishTime);
        return {
          ...row,
          type,
          ...times,
          duration: minutesToHM(diffMinutes(times.start, times.finish)),
        };
      })
    );
  }, [startTime, finishTime, extraEnabled, extraWorks.length]);

  const extraWorkMinutes = useMemo(() => {
    if (!extraEnabled) return 0;
    return extraWorks.reduce((total, extraWork) => {
      if (!extraWork.start || !extraWork.finish) return total;
      return total + diffMinutes(extraWork.start, extraWork.finish);
    }, 0);
  }, [extraEnabled, extraWorks]);

  const updateExtraWork = (index, patch) => {
    setExtraWorks((prev) =>
      prev.map((row, rowIndex) => {
        if (rowIndex !== index) return row;

        const nextRow = { ...row, ...patch };
        if (patch.type) {
          const times = getExtraWorkTimes(patch.type, startTime, finishTime);
          nextRow.start = times.start;
          nextRow.finish = times.finish;
        }
        nextRow.duration =
          nextRow.start && nextRow.finish
            ? minutesToHM(diffMinutes(nextRow.start, nextRow.finish))
            : "";
        return nextRow;
      })
    );
  };

  const handleRemoveExtraRow = (index) => {
    setExtraWorks((prev) => prev.filter((_, rowIndex) => rowIndex !== index));
  };

  const resetExtraWorks = () => {
    setExtraEnabled(false);
    setExtraWorks([]);
  };

  return {
    extraEnabled,
    extraWorkMinutes,
    extraWorks,
    handleRemoveExtraRow,
    resetExtraWorks,
    setExtraEnabled,
    updateExtraWork,
  };
}
