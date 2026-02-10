import { useState, useEffect, useMemo } from "react";
import {
  diffMinutes,
  minutesToHM,
} from "../utils/timeUtils";
import workTimeList from "../js/workTimeList";

export function useActivityForm() {
  const [location, setLocation] = useState("");
  const [workTime, setWorkTime] = useState("");
  const [startTime, setStartTime] = useState("");
  const [finishTime, setFinishTime] = useState("");
  const [totalWorkTime, setTotalWorkTime] = useState("");

  const [baseShift, setBaseShift] = useState("주간");
  const [isSpecial, setIsSpecial] = useState(false);

  const [extraEnabled, setExtraEnabled] = useState(false);
  const [extraWorks, setExtraWorks] = useState([]);
  const [cart, setCart] = useState([]);

  const filteredWorkTimeList = useMemo(
    () => workTimeList.filter((t) => t.shift === baseShift),
    [baseShift]
  );

  useEffect(() => {
    if (startTime && finishTime) {
      setTotalWorkTime(minutesToHM(diffMinutes(startTime, finishTime)));
    } else {
      setTotalWorkTime("");
    }
  }, [startTime, finishTime]);

  useEffect(() => {
    if (extraEnabled && extraWorks.length === 0) {
      setExtraWorks([{ type: "", start: "", finish: "", duration: "" }]);
    }
    if (!extraEnabled) setExtraWorks([]);
  }, [extraEnabled]);

  return {
    // 상태
    location,
    workTime,
    startTime,
    finishTime,
    totalWorkTime,
    baseShift,
    isSpecial,
    extraEnabled,
    extraWorks,
    cart,
    filteredWorkTimeList,

    // setter
    setLocation,
    setWorkTime,
    setStartTime,
    setFinishTime,
    setBaseShift,
    setIsSpecial,
    setExtraEnabled,
    setExtraWorks,
    setCart,
  };
}
