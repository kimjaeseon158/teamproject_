import { useState } from "react";

export function useCalendarState() {
  const today = new Date();

  const formatLocal = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const initialDate = {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
    formatted: formatLocal(today),
  };

  const [selectedDate, setSelectedDate] = useState(initialDate);

  /* 🔥 dateStr 그대로 받음 */
  const handleDateClick = (dateStr) => {

    const d = new Date(dateStr);

    const next = {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
      formatted: dateStr,
    };

    setSelectedDate(next);
  };

  const goToday = () => {
    const api = window.calendarRef?.getApi();
    if (!api) return;

    api.today();

    const d = api.getDate();

    const next = {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
      formatted: formatLocal(d),
    };

    setSelectedDate(next);
  };

  const goToDate = ({ formatted }) => {
    const api = window.calendarRef?.getApi();
    if (!api) return;

    api.gotoDate(formatted);

    const d = new Date(formatted);

    const next = {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
      formatted,
    };

    setSelectedDate(next);
  };

  return {
    selectedDate,
    setSelectedDate,
    handleDateClick,
    goToday,
    goToDate,
  };
}