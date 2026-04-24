import {
  Box,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";

import CalendarSidebar from "../components/CalendarSidebar";
import CalendarHeader from "../components/CalendarHeader";
import CalendarView from "../../../common/CalendarView";
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
      {/* 폼 입력 드로어 (바텀 시트 스타일) */}
      <Drawer
        isOpen={isOpen}
        placement="bottom"
        onClose={onClose}
      >
        <DrawerOverlay backdropFilter="blur(4px)" />
        <DrawerContent 
          h="94dvh" 
          borderTopRadius="30px" 
          boxShadow="0 -10px 20px rgba(0,0,0,0.1)"
        >
          {/* 상단 시트 핸들러 (드래그 느낌) */}
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
            events={calendar.events} // 🔥 추가
          />
        </DrawerContent>
      </Drawer>

      <VStack spacing={4} align="stretch" p={4}>
        {/* 상단 헤더 영역 */}
        <Box>
          <CalendarHeader
            userUuid={userUuid}
            goToday={goToday}
            calendarTitle={calendarTitle}
            setCalendarTitle={onTitleChange}
            summary={calendar.summary}
            hideSummaryOnMobile={true}
          />
        </Box>

        {/* 메인 캘린더 카드 */}
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
              // 🔥 모든 날짜에서 드로어를 열도록 변경
              calendar.handleDateClick(arg);
              onOpen();
            }}
            onTitleChange={onTitleChange}
            isMobile={isMobile}
          />
        </Box>

        {/* 하단 요약 정보 카드 */}
        <Box 
          bg="white" 
          borderRadius="2xl" 
          p={5} 
          shadow="sm" 
          border="1px solid" 
          borderColor="gray.100"
          mb={4}
        >
          <StatusLegend summary={calendar.summary} />
        </Box>
      </VStack>
    </Box>
  );
}