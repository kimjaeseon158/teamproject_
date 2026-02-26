import { useBreakpointValue, useMediaQuery  } from "@chakra-ui/react";
import { useState } from "react";
import { useUser } from "../../feactures/auth/userContext";
import { useCalendarState } from "../../feactures/user/hook/useCalendarsState";
import "../css/calender.css";

import CalendarDesktopLayout from "../../feactures/user/layout/CalendarDesktopLayout";
import CalendarMobileLayout from "../../feactures/user/layout/CalendarMobileLayout";

export default function CalendarPage() {
  const { userName, userUuid } = useUser();
  const [calendarTitle, setCalendarTitle] = useState("");
  const [currentMonth, setCurrentMonth] = useState("");
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
  const handleTitleChange = (title, ym) => {
    setCalendarTitle(title);

    if (ym) {
      setCurrentMonth(ym); // 🔥 MonthPicker 동기화
    }
  };
  const layoutProps = {
    userName,
    userUuid,
    calendar,
    monthPickerYear,
    setMonthPickerYear,
    goToday,
    goToDate,

    calendarTitle,
    currentMonth,       // 🔥
    handleTitleChange,  // 🔥
  };

  return isMobile ? (
    <CalendarMobileLayout {...layoutProps} />
  ) : (
    <CalendarDesktopLayout {...layoutProps} />
  );
}
