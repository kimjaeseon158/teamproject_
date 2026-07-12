import { useState } from "react";
import { useMediaQuery } from "@chakra-ui/react";

import { useUser } from "../../auth/userContext";
import { useCalendarState } from "./useCalendarsState";

export default function useCalendarPage() {
  const { userName, userUuid } = useUser();
  const [calendarTitle, setCalendarTitle] = useState("");
  const calendar = useCalendarState();
  const [isMobile] = useMediaQuery("(max-width: 1024px)");

  const goToday = () => {
    const api = window.calendarRef?.getApi();
    if (!api) return;

    api.today();

    const d = api.getDate();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    calendar.setSelectedDate({
      year: y,
      month: d.getMonth() + 1,
      day: d.getDate(),
      formatted: `${y}-${m}-${day}`,
    });
  };

  const goToDate = ({ formatted }) => {
    window.calendarRef?.getApi()?.gotoDate(formatted);
  };

  const handleTitleChange = (ym) => {
    setCalendarTitle(ym);
    calendar.loadMonthlyData(ym);
  };

  return {
    calendar,
    calendarTitle,
    goToday,
    goToDate,
    isMobile,
    onTitleChange: handleTitleChange,
    userName,
    userUuid,
  };
}
