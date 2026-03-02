import { useMediaQuery } from "@chakra-ui/react";
import { useState } from "react";
import { useUser } from "../../feactures/auth/userContext";
import { useCalendarState } from "../../feactures/user/hook/useCalendarsState";

import CalendarDesktopLayout from "../../feactures/user/layout/CalendarDesktopLayout";
import CalendarMobileLayout from "../../feactures/user/layout/CalendarMobileLayout";

import "../css/calender.css"

export default function CalendarPage() {
  const { userName, userUuid } = useUser();
  const [calendarTitle, setCalendarTitle] = useState("");
  const calendar = useCalendarState();

  const [isMobile] = useMediaQuery("(max-width: 1024px)");

  const goToday = () => {
    const api = window.calendarRef?.getApi();
    if (!api) return;

    api.today();

    const d = api.getDate();
    calendar.setSelectedDate({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
      formatted: d.toISOString().slice(0, 10),
    });
  };

  const goToDate = ({ formatted }) => {
    window.calendarRef?.getApi()?.gotoDate(formatted);
  };

  const handleTitleChange = (ym) => {
    setCalendarTitle(ym);
  };

  const layoutProps = {
    userName,
    userUuid,
    calendar,
    goToday,
    goToDate,
    calendarTitle,
    onTitleChange: handleTitleChange,
  };

  return isMobile ? (
    <CalendarMobileLayout {...layoutProps} />
  ) : (
    <CalendarDesktopLayout {...layoutProps} />
  );
}