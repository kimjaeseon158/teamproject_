// src/user_calender/hooks/useCalendarState.js
import { useState } from "react";

export function useCalendarState() {
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateClick = (info) => {
    const d = info.date;
    const next = {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
      formatted: d.toISOString().slice(0, 10),
    };

    setSelectedDate(next);
    window.selectedDate = next; // 🔥 CalendarView용
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
      formatted: d.toISOString().slice(0, 10),
    };

    setSelectedDate(next);
    window.selectedDate = next;
  };

  const goToDate = ({ year, month, day, formatted }) => {
    const api = window.calendarRef?.getApi();
    if (!api) return;

    api.gotoDate(formatted);

    const next = { year, month, day, formatted };
    setSelectedDate(next);
    window.selectedDate = next;
  };

  return {
    selectedDate,
    setSelectedDate, // ✅ 이거 추가
    handleDateClick,
    goToday,
    goToDate,
  };
}
