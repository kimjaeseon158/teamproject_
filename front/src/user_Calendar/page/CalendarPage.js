import { useBreakpointValue, useMediaQuery  } from "@chakra-ui/react";
import { useState } from "react";
import { useUser } from "../../login/js/userContext";
import { useCalendarState } from "../hooks/useCalendarsState";
import "../css/calender.css";

import CalendarDesktopLayout from "../layout/CalendarDesktopLayout";
import CalendarMobileLayout from "../layout/CalendarMobileLayout";

export default function CalendarPage() {
  const { userName, userUuid } = useUser();
  const [calendarTitle, setCalendarTitle] = useState("");

  const calendar = useCalendarState();

  const [isMobile] = useMediaQuery("(max-width: 1024px)");
  const [monthPickerYear, setMonthPickerYear] = useState(
    new Date().getFullYear()
  );

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

  const layoutProps = {
    userName,
    userUuid,
    calendar,
    monthPickerYear,
    setMonthPickerYear,
    goToday,
    goToDate,

    calendarTitle,        // 🔥 추가
    setCalendarTitle, 
  };

  return isMobile ? (
    <CalendarMobileLayout {...layoutProps} />
  ) : (
    <CalendarDesktopLayout {...layoutProps} />
  );
}
