import { Box, Button, Icon, useDisclosure } from "@chakra-ui/react";
import { FiCalendar } from "react-icons/fi";

import CalendarView from "../../../common/CalendarView";
import CalendarHeader from "../components/CalendarHeader";
import CalendarSidebar from "../components/CalendarSidebar";
import EditPendingWorkModal from "../components/calendarSidebar/EditPendingWorkModal";
import PendingWorkSelectModal from "../components/calendarSidebar/PendingWorkSelectModal";
import MonthlyComparisonDrawer from "../components/MonthlyComparisonDrawer";
import WorkSchedulePreviewPanel from "../components/WorkSchedulePreviewPanel";

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
  comparison,
  isComparisonOpen,
  onCloseComparison,
  onOpenComparison,
}) {
  const workSchedule = useDisclosure();

  return (
    <Box display="flex" height="100vh" overflow="hidden">
      <WorkSchedulePreviewPanel
        isOpen={workSchedule.isOpen}
        onClose={workSchedule.onClose}
        selectedDate={calendar.selectedDate}
      />

      <Button
        position="fixed"
        right={0}
        top="50%"
        transform="translateY(-50%)"
        zIndex={10}
        w="38px"
        minW="38px"
        h="124px"
        px={0}
        colorScheme="blue"
        borderRightRadius={0}
        borderLeftRadius="lg"
        boxShadow="lg"
        aria-label="근무표 조회"
        onClick={workSchedule.onOpen}
      >
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Icon as={FiCalendar} boxSize={4} />
          <Box as="span" sx={{ writingMode: "vertical-rl" }} letterSpacing="2px">근무표</Box>
        </Box>
      </Button>
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

      <MonthlyComparisonDrawer
        comparison={comparison}
        isOpen={isComparisonOpen}
        onClose={onCloseComparison}
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
          onMonthlyCompareOpen={onOpenComparison}
          comparisonLoading={comparison.isLoading}
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
