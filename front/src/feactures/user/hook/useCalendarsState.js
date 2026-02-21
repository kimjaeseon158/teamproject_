// src/user_calender/hooks/useCalendarState.js
import { useState } from "react";

export function useCalendarState() {
  const today = new Date();

  const initialDate = {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
    formatted: today.toISOString().slice(0, 10),
  };

  const [selectedDate, setSelectedDate] = useState(initialDate);

  const handleDateClick = (info) => {
    const d = info.date;

    const next = {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
      formatted: d.toISOString().slice(0, 10),
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
      formatted: d.toISOString().slice(0, 10),
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
