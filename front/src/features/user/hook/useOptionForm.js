import { useEffect, useMemo, useState } from "react";

import { getExtraWorkTimes } from "../../common/workTimeUtils";
import workTimeList from "../data/workTimeList";
import { calculateNetMinutes, diffMinutes, minutesToHM } from "../utils/timeUtils";
import { useOptionHandlers } from "./useOptionHandlers";

const DEFAULT_MOBILE_START_TIME = "08:00";
const DEFAULT_MOBILE_FINISH_TIME = "17:00";
const DEFAULT_MOBILE_WORK_TIME = `${DEFAULT_MOBILE_START_TIME}~${DEFAULT_MOBILE_FINISH_TIME}`;

const createExtraWorkRow = (type = "weekday_ot", startTime = "", finishTime = "") => {
  const times = getExtraWorkTimes(type, startTime, finishTime);
  return {
    type,
    ...times,
    duration: minutesToHM(diffMinutes(times.start, times.finish)),
  };
};

export default function useOptionForm({
  isMobile,
  onClose,
  onRefresh,
  selectedDate,
  toast,
  userName,
  userUuid,
}) {
  const [location, setLocation] = useState("");
  const [workTime, setWorkTime] = useState("");
  const [startTime, setStartTime] = useState("");
  const [finishTime, setFinishTime] = useState("");
  const [baseShift, setBaseShift] = useState("주간");
  const [isSpecial, setIsSpecial] = useState(false);
  const [extraEnabled, setExtraEnabled] = useState(false);
  const [extraWorks, setExtraWorks] = useState([]);
  const [cart, setCart] = useState([]);
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredWorkTimeList = useMemo(
    () => workTimeList.filter((time) => time.shift === baseShift),
    [baseShift]
  );

  useEffect(() => {
    if (!isMobile) return;

    setStartTime((prev) => prev || DEFAULT_MOBILE_START_TIME);
    setFinishTime((prev) => prev || DEFAULT_MOBILE_FINISH_TIME);
    setWorkTime((prev) => prev || DEFAULT_MOBILE_WORK_TIME);
  }, [isMobile]);

  const totalWorkTimeHM = useMemo(() => {
    let totalMins = 0;

    if (startTime && finishTime) {
      totalMins += calculateNetMinutes(startTime, finishTime);
    }

    if (extraEnabled) {
      extraWorks.forEach((extraWork) => {
        if (extraWork.start && extraWork.finish) {
          totalMins += diffMinutes(extraWork.start, extraWork.finish);
        }
      });
    }

    return totalMins > 0 ? minutesToHM(totalMins) : "";
  }, [startTime, finishTime, extraEnabled, extraWorks]);

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

  const resetForm = () => {
    setLocation("");
    setWorkTime(isMobile ? DEFAULT_MOBILE_WORK_TIME : "");
    setStartTime(isMobile ? DEFAULT_MOBILE_START_TIME : "");
    setFinishTime(isMobile ? DEFAULT_MOBILE_FINISH_TIME : "");
    setIsSpecial(false);
    setExtraEnabled(false);
    setExtraWorks([]);
  };

  const handleShiftChange = (shift) => {
    setBaseShift(shift);
    setWorkTime("");
    setStartTime("");
    setFinishTime("");
  };

  const handleSelectWorkTime = (start, finish) => {
    setStartTime(start);
    setFinishTime(finish);
    setWorkTime(`${start}~${finish}`);
  };

  const handleStartTimeChange = (value) => {
    setStartTime(value);
    setWorkTime(`${value}~${finishTime || DEFAULT_MOBILE_FINISH_TIME}`);
  };

  const handleFinishTimeChange = (value) => {
    setFinishTime(value);
    setWorkTime(`${startTime || DEFAULT_MOBILE_START_TIME}~${value}`);
  };

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

  const handlers = useOptionHandlers({
    selectedDate,
    userUuid,
    userName,
    cart,
    setCart,
    toast,
    resetForm,
    baseShift,
    isSpecial,
    startTime,
    finishTime,
    location,
    extraEnabled,
    extraWorks,
    setIsSubmitConfirmOpen,
    isSubmitting,
    setIsSubmitting,
    onRefresh,
    onClose,
  });

  useEffect(() => {
    if (cart.length === 0 && isSubmitConfirmOpen) {
      setIsSubmitConfirmOpen(false);
    }
  }, [cart.length, isSubmitConfirmOpen]);

  return {
    baseShift,
    cart,
    extraEnabled,
    extraWorks,
    filteredWorkTimeList,
    finishTime,
    handleFinishTimeChange,
    handleRemoveExtraRow,
    handleSelectWorkTime,
    handleShiftChange,
    handleStartTimeChange,
    isSpecial,
    isSubmitConfirmOpen,
    location,
    setExtraEnabled,
    setIsSpecial,
    setIsSubmitConfirmOpen,
    setLocation,
    startTime,
    totalWorkTimeHM,
    updateExtraWork,
    workTime,
    ...handlers,
  };
}
