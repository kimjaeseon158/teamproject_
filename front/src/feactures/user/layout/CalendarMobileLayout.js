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
  monthPickerYear,
  setMonthPickerYear,
  goToday,
  goToDate,

  calendarTitle,      // 🔥 추가
  setCalendarTitle,   // 🔥 추가
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
   <Box minH="100vh" bg="white" overflow="hidden" >

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

    <Box
      px={4}
      pt={4}
      display="flex"
      flexDirection="column"
    >
      <CalendarHeader
        userUuid={userUuid}
        monthPickerYear={monthPickerYear}
        setMonthPickerYear={setMonthPickerYear}
        goToday={goToday}
        goToDate={goToDate}
        calendarTitle={calendarTitle}
      />

      <Box mt={4} width="100%">
        <CalendarView
          events={[]}
          onDateClick={(arg) => {
            
            calendar.handleDateClick(arg);
            onOpen();
          }}
          selectedDate={calendar.selectedDate}
          onTitleChange={setCalendarTitle}
        />
      </Box>
    </Box>
  </Box>
  );
}
