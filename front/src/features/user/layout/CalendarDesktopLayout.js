import { Box } from "@chakra-ui/react";

import CalendarView from "../../../common/CalendarView";
import CalendarHeader from "../components/CalendarHeader";
import CalendarSidebar from "../components/CalendarSidebar";
import EditPendingWorkModal from "../components/calendarSidebar/EditPendingWorkModal";
import PendingWorkSelectModal from "../components/calendarSidebar/PendingWorkSelectModal";

export default function CalendarDesktopLayout({
  userName,
  userUuid,
  calendar,
  goToday,
  goToDate,
  calendarTitle,
  editingWork,
  onCloseEditWork,
  onCloseSelectWork,
  onEditWork,
  onEventClick,
  onSelectPendingWork,
  onTitleChange,
  selectableWorks,
  isMobile,
}) {
  return (
    <Box display="flex" height="100vh" overflow="hidden">
      <PendingWorkSelectModal
        forceBottomSheet={isMobile}
        isOpen={selectableWorks.length > 0}
        items={selectableWorks}
        onClose={onCloseSelectWork}
        onSelect={onSelectPendingWork}
      />

      <EditPendingWorkModal
        forceBottomSheet={isMobile}
        isOpen={Boolean(editingWork)}
        onClose={onCloseEditWork}
        onRefresh={calendar.loadMonthlyData}
        selectedDate={calendar.selectedDate}
        work={editingWork}
      />

      <Box w="18%" minW="250px">
        <CalendarSidebar
          userName={userName}
          selectedDate={calendar.selectedDate}
          onEditWork={onEditWork}
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
            onEventClick={onEventClick}
            onTitleChange={onTitleChange}
            isMobile={isMobile}
            summary={calendar.summary}
          />
        </Box>
      </Box>
    </Box>
  );
}
