import { useEffect, useMemo, useState } from "react";

import workTimeList from "../data/workTimeList";
import { calculateNetMinutes, diffMinutes, minutesToHM } from "../utils/timeUtils";

export const DEFAULT_MOBILE_START_TIME = "08:00";
export const DEFAULT_MOBILE_FINISH_TIME = "17:00";
export const DEFAULT_MOBILE_WORK_TIME = `${DEFAULT_MOBILE_START_TIME}~${DEFAULT_MOBILE_FINISH_TIME}`;

export default function useOptionWorkTime(isMobile) {
  const [workTime, setWorkTime] = useState("");
  const [startTime, setStartTime] = useState("");
  const [finishTime, setFinishTime] = useState("");
  const [baseShift, setBaseShift] = useState("주간");
  const [isSpecial, setIsSpecial] = useState(false);

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

  const baseWorkMinutes = useMemo(() => {
    if (!startTime || !finishTime) return 0;
    return calculateNetMinutes(startTime, finishTime);
  }, [startTime, finishTime]);

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

  const resetWorkTime = () => {
    setWorkTime(isMobile ? DEFAULT_MOBILE_WORK_TIME : "");
    setStartTime(isMobile ? DEFAULT_MOBILE_START_TIME : "");
    setFinishTime(isMobile ? DEFAULT_MOBILE_FINISH_TIME : "");
    setIsSpecial(false);
  };

  return {
    baseShift,
    baseWorkMinutes,
    filteredWorkTimeList,
    finishTime,
    handleFinishTimeChange,
    handleSelectWorkTime,
    handleShiftChange,
    handleStartTimeChange,
    isSpecial,
    resetWorkTime,
    setIsSpecial,
    startTime,
    workTime,
  };
}

export const minutesToWorkTimeLabel = minutesToHM;
export const getWorkTimeDiffMinutes = diffMinutes;
