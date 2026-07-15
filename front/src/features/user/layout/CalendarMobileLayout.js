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
import StatusLegend from "../components/StatusLegend";

export default function CalendarMobileLayout({
  userName,
  userUuid,
  calendar,
  goToday,
  calendarTitle,
  onTitleChange,
  isMobile,
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box minH="100vh" bg="gray.50" overflowX="hidden">
      <Drawer isOpen={isOpen} placement="bottom" onClose={onClose}>
        <DrawerOverlay backdropFilter="blur(4px)" />
        <DrawerContent
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
            setCalendarTitle={onTitleChange}
            summary={calendar.summary}
            hideSummaryOnMobile
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
            onTitleChange={onTitleChange}
            isMobile={isMobile}
          />
        </Box>
      </VStack>
    </Box>
  );
}
