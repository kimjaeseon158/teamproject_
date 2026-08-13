import {
  Box,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";

import CalendarView from "../../../common/CalendarView";
import CalendarHeader from "../components/CalendarHeader";
import CalendarSidebar from "../components/CalendarSidebar";
import EditPendingWorkModal from "../components/calendarSidebar/EditPendingWorkModal";
import PendingWorkSelectModal from "../components/calendarSidebar/PendingWorkSelectModal";
import StatusLegend from "../components/StatusLegend";
import WorkSchedulePreviewPanel from "../components/WorkSchedulePreviewPanel";
import MonthlyComparisonDrawer from "../components/MonthlyComparisonDrawer";

export default function CalendarMobileLayout({
  userName,
  userUuid,
  calendar,
  goToday,
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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const workScheduleDisclosure = useDisclosure();

  return (
    <Box minH="100vh" bg="gray.50" overflowX="hidden">
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

      <WorkSchedulePreviewPanel
        isOpen={workScheduleDisclosure.isOpen}
        onClose={workScheduleDisclosure.onClose}
        selectedDate={calendar.selectedDate}
      />

      <MonthlyComparisonDrawer
        comparison={comparison}
        isOpen={isComparisonOpen}
        onClose={onCloseComparison}
      />

      <Drawer isOpen={isOpen} placement="bottom" onClose={onClose}>
        <DrawerOverlay backdropFilter="blur(4px)" />
        <DrawerContent
          bg="#1c1c1e"
          color="white"
          h="94dvh"
          borderTopRadius="30px"
          boxShadow="0 -10px 20px rgba(0,0,0,0.1)"
        >
          <Box
            w="40px"
            h="5px"
            bg="gray.300"
            borderRadius="full"
            mx="auto"
            mt={3}
            mb={1}
          />
          <CalendarSidebar
            userName={userName}
            selectedDate={calendar.selectedDate}
            onClose={onClose}
            onEditWork={(work) => {
              onClose();
              onEditWork(work);
            }}
            onRefresh={calendar.loadMonthlyData}
            onDateChange={calendar.handleDateClick}
            events={calendar.events}
            isMobileLayout={isMobile}
          />
        </DrawerContent>
      </Drawer>

      <VStack spacing={3} align="stretch" p={4}>
        <Box>
          <CalendarHeader
            userUuid={userUuid}
            goToday={goToday}
            calendarTitle={calendarTitle}
            onWorkScheduleOpen={workScheduleDisclosure.onOpen}
            setCalendarTitle={onTitleChange}
            summary={calendar.summary}
            hideActions={workScheduleDisclosure.isOpen}
            hideSummaryOnMobile
            onMonthlyCompareOpen={onOpenComparison}
            comparisonLoading={comparison.isLoading}
          />
        </Box>

        <Box
          bg="white"
          borderRadius="xl"
          px={4}
          py={3}
          shadow="sm"
          border="1px solid"
          borderColor="gray.100"
        >
          <StatusLegend summary={calendar.summary} variant="compact" />
        </Box>

        <Box
          bg="white"
          borderRadius="2xl"
          p={2}
          shadow="sm"
          border="1px solid"
          borderColor="gray.100"
        >
          <CalendarView
            events={calendar.events}
            selectedDate={calendar.selectedDate}
            onDateClick={(arg) => {
              calendar.handleDateClick(arg);
              onOpen();
            }}
            onEventClick={(event) => {
              const openedEdit = onEventClick(event);
              if (!openedEdit) onOpen();
            }}
            onTitleChange={onTitleChange}
            isMobile={isMobile}
          />
        </Box>
      </VStack>
    </Box>
  );
}
