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
import StatusLegend from "../components/StatusLegend"; // 🔥 추가

export default function CalendarMobileLayout({
  userName,
  userUuid,
  calendar,
  goToday,
  calendarTitle,
  onTitleChange, 
  isMobile, // 🔥 추가
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box minH="100vh" bg="white" overflow="hidden">

      <Drawer
        isOpen={isOpen}
        placement="bottom"
        onClose={onClose}
      >
        <DrawerOverlay />
        <DrawerContent h="100dvh" borderTopRadius="20px">
          <CalendarSidebar
            userName={userName}
            selectedDate={calendar.selectedDate}
            onClose={onClose}
            onRefresh={calendar.loadMonthlyData} // 🔥 추가
          />
        </DrawerContent>
      </Drawer>

      <Box px={4} pt={4}>

        <CalendarHeader
          userUuid={userUuid}
          goToday={goToday}
          calendarTitle={calendarTitle}
          setCalendarTitle={onTitleChange}
          summary={calendar.summary} // 🔥 전달
          hideSummaryOnMobile={true}  // 🔥 상단 요약 숨김
        />

        <Box mt={4}>
          <CalendarView
            events={calendar.events} // 🔥 백엔드 이벤트 적용
            selectedDate={calendar.selectedDate}
            onDateClick={(arg) => {
              // 🔥 이미 이벤트(금액)가 있는 날짜인지 확인
              const hasEvent = calendar.events.some(e => e.start === arg);
              if (hasEvent) return; 

              calendar.handleDateClick(arg);
              onOpen();
            }}
            onTitleChange={onTitleChange}
            isMobile={isMobile} // 🔥 전달
          />
        </Box>

        {/* 🔥 하단 요약 정보 추가 */}
        <Box mt={6} pb={8} px={2}>
          <StatusLegend summary={calendar.summary} />
        </Box>

      </Box>
    </Box>
  );
}