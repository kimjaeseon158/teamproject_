// src/user_calender/page/CalendarPage.jsx
import { Box } from "@chakra-ui/react";
import { useState } from "react";
import { useUser } from "../../login/js/userContext";
import { useCalendarState } from "../hooks/useCalendarsState";

import CalendarSidebar from "../components/CalendarSidebar";
import CalendarHeader from "../components/CalendarHeader";
import CalendarView from "../components/CalendarView";

import "../css/calender.css";

export default function CalendarPage() {
  const { userName, userUuid } = useUser();
  const calendar = useCalendarState();

  const [monthPickerYear, setMonthPickerYear] = useState(
    new Date().getFullYear()
  );

  /* Today 버튼 */
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

  return (
    <Box display="flex" height="100vh" overflow="hidden">
      {/* 사이드바 */}
      <CalendarSidebar
        userName={userName}
        selectedDate={calendar.selectedDate}
      />

      {/* 메인 영역 */}
      <Box flex="1" px="20px" pt="30px">
        {/* ✅ 헤더 */}
        <CalendarHeader
          userUuid={userUuid}
          monthPickerYear={monthPickerYear}
          setMonthPickerYear={setMonthPickerYear}
          goToday={goToday}
          goToDate={goToDate}
        />

        {/* 캘린더 */}
        <Box mt={2} height="calc(100vh - 120px)" pt="35px">
          <CalendarView
            events={[]}
            onDateClick={calendar.handleDateClick}
            selectedDate={calendar.selectedDate}
          />
        </Box>
      </Box>
    </Box>
  );
}
