import { useState } from "react";

import { fetchUserMonthlySummary } from "../api/userMonthly";

const formatLocalDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
};

const getStatusColor = (isApproved) => {
  if (isApproved === true) return "#28a745";
  if (isApproved === false) return "#dc3545";
  return "#ffc107";
};

const getWorkType = (item) =>
  item.details?.[0]?.work_type ||
  item.detail_amounts?.[0]?.work_type ||
  item.work_type ||
  item.work_shift;

const toCalendarEvents = (dailyList = []) => {
  const groupedByDate = dailyList.reduce((acc, item) => {
    const dateItems = acc.get(item.date) || [];
    dateItems.push(item);
    acc.set(item.date, dateItems);
    return acc;
  }, new Map());

  return Array.from(groupedByDate.entries()).map(([date, items]) => {
    const primary = items[0];
    const color = getStatusColor(primary.is_approved);
    const workType = getWorkType(primary);
    const totalAmount = items.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0
    );

    return {
      id: `${date}-${primary.work_place}`,
      title: `근무지 - ${primary.work_place}\n${workType} - ${Number(
        primary.amount || 0
      ).toLocaleString()}원`,
      start: date,
      backgroundColor: color,
      borderColor: color,
      textColor: primary.is_approved === null ? "black" : "white",
      extendedProps: {
        ...primary,
        work_type: workType,
        calendar_amount: totalAmount,
        grouped_items: items,
        extra_count: Math.max(0, items.length - 1),
      },
    };
  });
};

export function useCalendarState() {
  const today = new Date();
  const initialDate = {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
    formatted: formatLocalDate(today),
  };

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState(null);

  const loadMonthlyData = async (ym) => {
    try {
      const data = await fetchUserMonthlySummary(ym);
      setSummary(data);
      setEvents(toCalendarEvents(data.daily_list || []));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDateClick = (dateStr) => {
    const d = new Date(dateStr);
    setSelectedDate({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
      formatted: dateStr,
    });
  };

  const goToday = () => {
    const api = window.calendarRef?.getApi();
    if (!api) return;

    api.today();
    const d = api.getDate();

    setSelectedDate({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
      formatted: formatLocalDate(d),
    });
  };

  const goToDate = ({ formatted }) => {
    const api = window.calendarRef?.getApi();
    if (!api) return;

    api.gotoDate(formatted);
    const d = new Date(formatted);

    setSelectedDate({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
      formatted,
    });
  };

  return {
    selectedDate,
    setSelectedDate,
    handleDateClick,
    goToday,
    goToDate,
    events,
    summary,
    loadMonthlyData,
  };
}
