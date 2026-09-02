import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "@chakra-ui/react";

import { fetchUserWorkSchedule } from "../../../user/api/userWorkSchedule";
import { fetchAdminWorkSchedules } from "../../../admin/work_schedule/api/adminWorkSchedules";
import { addDaysToDateValue, toLocalDateValue } from "../../../common/utils/dateValue";
import { useUser } from "../../../auth/userContext";

const mondayOf = (dateValue) => {
  const day = new Date(`${dateValue}T00:00:00`).getDay();
  return addDaysToDateValue(dateValue, -((day + 6) % 7));
};

const monthOf = (dateValue) => dateValue?.slice(0, 7) || "";

const getMonthWeeks = (monthValue) => {
  if (!monthValue) return [];
  const [year, month] = monthValue.split("-").map(Number);
  const firstDay = `${monthValue}-01`;
  const lastDay = toLocalDateValue(new Date(year, month, 0));
  const weeks = [];
  for (let start = mondayOf(firstDay); start <= lastDay; start = addDaysToDateValue(start, 7)) {
    weeks.push({ start, end: addDaysToDateValue(start, 6) });
  }
  return weeks;
};

const addMonths = (monthValue, amount) => {
  const [year, month] = monthValue.split("-").map(Number);
  return toLocalDateValue(new Date(year, month - 1 + amount, 1)).slice(0, 7);
};

const scheduleMatches = (user, dates, searchType, keyword) => {
  if (!keyword) return true;
  if (searchType === "user_name") return user.user_name?.toLowerCase().includes(keyword);
  return dates.some((targetDate) => (user.days?.[targetDate] || []).some((item) =>
    item?.[searchType]?.toLowerCase().includes(keyword)
  ));
};

export default function useBoardWorkSchedule() {
  const toast = useToast();
  const { loginType } = useUser();
  const today = toLocalDateValue();
  const [date, setDate] = useState(() => mondayOf(today));
  const [selectedMonth, setSelectedMonth] = useState(() => monthOf(today));
  const [data, setData] = useState({ dates: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("ALL");
  const [searchType, setSearchType] = useState("user_name");
  const [keyword, setKeyword] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");
  const [appliedSearchType, setAppliedSearchType] = useState("user_name");
  const appliedSearch = useRef({ keyword: "", type: "user_name" });

  const load = useCallback(async (targetDate, targetKeyword = "", targetSearchType = "user_name") => {
    const normalizedKeyword = targetKeyword.trim();
    setLoading(true);
    try {
      const filters = normalizedKeyword ? { [targetSearchType]: normalizedKeyword } : {};
      const response = loginType === "admin"
        ? await fetchAdminWorkSchedules(targetDate, { toast })
        : await fetchUserWorkSchedule({ date: targetDate, ...filters }, { toast });
      setData(response || { dates: [], users: [] });
      setAppliedKeyword(normalizedKeyword);
      setAppliedSearchType(targetSearchType);
      appliedSearch.current = { keyword: normalizedKeyword, type: targetSearchType };
    } catch (error) {
      toast({ title: "근무표 조회에 실패했습니다.", description: error.message, status: "error" });
    } finally {
      setLoading(false);
    }
  }, [loginType, toast]);

  useEffect(() => {
    load(date, appliedSearch.current.keyword, appliedSearch.current.type);
  }, [date, load]);

  const dates = useMemo(() => data.dates || [], [data.dates]);
  const users = useMemo(() => {
    const normalizedKeyword = appliedKeyword.toLowerCase();
    const source = (data.users || []).filter((user) =>
      scheduleMatches(user, dates, appliedSearchType, normalizedKeyword)
    );
    if (status === "ALL") return source;
    return source.filter((user) => dates.some((targetDate) =>
      (user.days?.[targetDate] || []).some((item) => item.status === status)
    ));
  }, [appliedKeyword, appliedSearchType, data.users, dates, status]);

  const scheduleCount = useMemo(() => users.reduce(
    (total, user) => total + dates.reduce(
      (subtotal, targetDate) => subtotal + (user.days?.[targetDate] || []).length,
      0
    ),
    0
  ), [dates, users]);

  const selectWeek = (weekStart) => setDate(mondayOf(weekStart));
  const selectMonth = (monthValue) => {
    const firstWeek = getMonthWeeks(monthValue)[0];
    if (!firstWeek) return;
    setSelectedMonth(monthValue);
    selectWeek(firstWeek.start);
  };
  const goCurrentWeek = () => {
    setSelectedMonth(monthOf(today));
    selectWeek(today);
  };
  const monthWeeks = useMemo(() => getMonthWeeks(selectedMonth), [selectedMonth]);

  return {
    appliedKeyword,
    appliedSearchType,
    data: { ...data, users },
    date,
    keyword,
    loading,
    monthWeeks,
    scheduleCount,
    searchType,
    selectedMonth,
    status,
    goCurrentWeek,
    moveMonth: (amount) => selectMonth(addMonths(selectedMonth, amount)),
    search: () => load(date, keyword, searchType),
    selectMonth,
    selectWeek,
    setKeyword,
    setSearchType,
    setStatus,
  };
}
