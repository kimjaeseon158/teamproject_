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
  setCalendarTitle,
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box minH="100vh" bg="white" overflow="hidden">

      <Drawer
        isOpen={isOpen}
        placement="bottom"
        onClose={onClose}
        blockScrollOnMount
        autoFocus={false}
        returnFocusOnClose={false}
      >
        <DrawerOverlay />
        <DrawerContent
          h="100dvh"
          overflow="hidden"
          borderTopRadius="20px"
        >
          <CalendarSidebar
            userName={userName}
            selectedDate={calendar.selectedDate}
            onClose={onClose}
          />
        </DrawerContent>
      </Drawer>

      <Box px={4} pt={4} display="flex" flexDirection="column">

        <CalendarHeader
          userUuid={userUuid}
          goToday={goToday}
          calendarTitle={calendarTitle}
          setCalendarTitle={setCalendarTitle}
        />

        <Box mt={4} width="100%">
          <CalendarView
            events={[]}
            selectedDate={calendar.selectedDate}
            onDateClick={(arg) => {
              calendar.handleDateClick(arg);
              onOpen();
            }}
            onTitleChange={setCalendarTitle}
          />
        </Box>

      </Box>
    </Box>
  );
}