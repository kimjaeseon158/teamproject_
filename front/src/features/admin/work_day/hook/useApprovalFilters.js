import { useMemo, useState } from "react";

import { APPROVAL_INITIAL_STATUS } from "../constants/approvalConstants";
import { getMonthRange, toMonthValue } from "../utils/approveDateUtils";
import { toYMD } from "../utils/approveUtils";

export const getInitialApprovalRange = () => {
  const today = new Date();
  const from = new Date(today.getFullYear(), today.getMonth(), 1);
  const to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return { from, to };
};

export default function useApprovalFilters() {
  const initialRange = useMemo(getInitialApprovalRange, []);
  const [status, setStatus] = useState(APPROVAL_INITIAL_STATUS);
  const [workPlace, setWorkPlace] = useState("");
  const [workType, setWorkType] = useState("");
  const [userName, setUserName] = useState("");
  const [extraWork, setExtraWork] = useState("");
  const [range, setRange] = useState(initialRange);
  const [selectedMonth, setSelectedMonth] = useState(toMonthValue(initialRange.from));

  const rangeLabel = useMemo(() => {
    if (!range?.from) return "날짜 선택";
    if (!range?.to) return toYMD(range.from);
    return `${toYMD(range.from)} ~ ${toYMD(range.to)}`;
  }, [range]);

  const getSearchParams = ({
    nextStatus = status,
    nextWorkPlace = workPlace,
    nextWorkType = workType,
    nextUserName = userName,
    nextExtraWork = extraWork,
    nextRange = range,
  } = {}) => ({
    status: nextStatus,
    workPlace: nextWorkPlace,
    workType: nextWorkType,
    userName: nextUserName,
    extraWork: nextExtraWork,
    range: nextRange,
  });

  const handleMonthChange = (monthValue) => {
    setSelectedMonth(monthValue);
    setRange(getMonthRange(monthValue));
  };

  const handleRangeChange = (nextRange) => {
    setSelectedMonth("");
    setRange(nextRange || { from: undefined, to: undefined });
  };

  const handleRangeReset = () => {
    setSelectedMonth("");
    setRange({ from: undefined, to: undefined });
  };

  const resetFilters = () => {
    setStatus(APPROVAL_INITIAL_STATUS);
    setWorkPlace("");
    setWorkType("");
    setUserName("");
    setExtraWork("");
  };

  return {
    extraWork,
    getSearchParams,
    handleMonthChange,
    handleRangeChange,
    handleRangeReset,
    initialRange,
    range,
    rangeLabel,
    resetFilters,
    selectedMonth,
    setExtraWork,
    setStatus,
    setUserName,
    setWorkPlace,
    setWorkType,
    status,
    userName,
    workPlace,
    workType,
  };
}
