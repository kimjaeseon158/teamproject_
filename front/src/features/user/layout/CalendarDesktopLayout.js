import { Box } from "@chakra-ui/react";

import CalendarView from "../../../common/CalendarView";
import CalendarHeader from "../components/CalendarHeader";
import CalendarSidebar from "../components/CalendarSidebar";

export default function CalendarDesktopLayout({
  userName,
  userUuid,
  calendar,
  goToday,
  goToDate,
  calendarTitle,
  onTitleChange,
  isMobile,
}) {
  return (
    <Box display="flex" height="100vh" overflow="hidden">
      <Box w="18%" minW="250px">
        <CalendarSidebar
          userName={userName}
          selectedDate={calendar.selectedDate}
          onRefresh={calendar.loadMonthlyData}
          events={calendar.events}
          isMobileLayout={isMobile}
        />
      </Box>

      <Box flex="1" px="20px" pt="30px" display="flex" flexDirection="column">
        <CalendarHeader
          userUuid={userUuid}
          goToday={goToday}
          goToDate={goToDate}
          calendarTitle={calendarTitle}
          setCalendarTitle={onTitleChange}
          summary={calendar.summary}
        />

        <Box flex="1" mt={2} overflow="hidden">
          <CalendarView
            events={calendar.events}
            selectedDate={calendar.selectedDate}
            onDateClick={calendar.handleDateClick}
            onTitleChange={onTitleChange}
            isMobile={isMobile}
            summary={calendar.summary}
          />
        </Box>
      </Box>
    </Box>
  );
}
