import { useMediaQuery } from "@chakra-ui/react";
import { useState } from "react";
import { useUser } from "../../features/auth/userContext";
import { useCalendarState } from "../../features/user/hook/useCalendarsState";

import CalendarDesktopLayout from "../../features/user/layout/CalendarDesktopLayout";
import CalendarMobileLayout from "../../features/user/layout/CalendarMobileLayout";

import "../css/calendar.css"

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
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const formatted = `${y}-${m}-${day}`;

    calendar.setSelectedDate({
      year: y,
      month: d.getMonth() + 1,
      day: d.getDate(),
      formatted: formatted,
    });
  };

  const goToDate = ({ formatted }) => {
    window.calendarRef?.getApi()?.gotoDate(formatted);
  };

  const handleTitleChange = (ym) => {
    setCalendarTitle(ym);
    calendar.loadMonthlyData(ym); // 🔥 월 변경 시 백엔드 데이터 요청
  };

  const layoutProps = {
    userName,
    userUuid,
    calendar,
    goToday,
    goToDate,
    calendarTitle,
    isMobile, // 🔥 추가
    onTitleChange: handleTitleChange,
  };

  return isMobile ? (
    <CalendarMobileLayout {...layoutProps} />
  ) : (
    <CalendarDesktopLayout {...layoutProps} />
  );
}