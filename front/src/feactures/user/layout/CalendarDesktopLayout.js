// src/feactures/user/layout/CalendarDesktopLayout.js

import { Box } from "@chakra-ui/react";
import CalendarSidebar from "../components/CalendarSidebar";
import CalendarHeader from "../components/CalendarHeader";
import CalendarView from "../../../common/CalendarView";

export default function CalendarDesktopLayout({
  userName,
  userUuid,
  calendar,
  goToday,
  goToDate,
  calendarTitle,
  onTitleChange,   // 🔥 이름 통일
}) {
  return (
    <Box display="flex" height="100vh" overflow="hidden">

      {/* 왼쪽 사이드바 */}
      <Box w="18%" minW="250px">
        <CalendarSidebar
          userName={userName}
          selectedDate={calendar.selectedDate}
        />
      </Box>

      {/* 오른쪽 메인 영역 */}
      <Box flex="1" px="20px" pt="30px" display="flex" flexDirection="column">

        {/* 헤더 */}
        <CalendarHeader
          userUuid={userUuid}
          goToday={goToday}
          goToDate={goToDate}
          calendarTitle={calendarTitle}
          setCalendarTitle={onTitleChange}  // 🔥 연결
        />

        {/* 캘린더 영역 */}
        <Box flex="1" mt={2} overflow="hidden">
          <CalendarView
            events={calendar.events} // 🔥 백엔드에서 가져온 이벤트 적용
            selectedDate={calendar.selectedDate}
            onDateClick={calendar.handleDateClick}
            onTitleChange={onTitleChange}
            summary={calendar.summary} // 요약 정보가 필요할 경우 대비
          />
        </Box>

      </Box>
    </Box>
  );
}