import {
  Box,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  useDisclosure,
} from "@chakra-ui/react";

import CalendarSidebar from "../components/CalendarSidebar";
import CalendarHeader from "../components/CalendarHeader";
import CalendarView from "../../../common/CalendarView";

export default function CalendarMobileLayout({
  userName,
  userUuid,
  calendar,
  goToday,
  calendarTitle,
  onTitleChange,
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box
      minH="100vh"
      bg="white"
      overflowX="hidden"
      overflowY={{ base: "auto", md: "hidden" }}
    >
      <Drawer isOpen={isOpen} placement="bottom" onClose={onClose}>
        <DrawerOverlay />

        <DrawerContent
          maxH="100dvh"
          borderTopRadius="20px"
          overflowY="auto"
        >
          <CalendarSidebar
            userName={userName}
            selectedDate={calendar.selectedDate}
            onClose={onClose}
          />
        </DrawerContent>
      </Drawer>

      <Box px={4} pt={4}>
        <CalendarHeader
          userUuid={userUuid}
          goToday={goToday}
          calendarTitle={calendarTitle}
          setCalendarTitle={onTitleChange}
        />

        <Box mt={4}>
          <CalendarView
            events={[]}
            selectedDate={calendar.selectedDate}
            onDateClick={(arg) => {
              calendar.handleDateClick(arg);
              onOpen();
            }}
            onTitleChange={onTitleChange}
          />
        </Box>
      </Box>
    </Box>
  );
}