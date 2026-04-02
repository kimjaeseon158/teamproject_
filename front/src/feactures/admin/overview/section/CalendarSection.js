import { Box, Flex, Button, Text, Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import CalendarView from "../../../../common/CalendarView";
import useApproveCalendar from "../hook/useApproveCalendar";

export default function CalendarSection({
  onUpdatePendingList,
  onSelectEvent,
}) {
  // 🔥 월 이동 시 일자 오버플로우 방지를 위해 항상 1일로 설정
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const { events, loading, rawData } =
    useApproveCalendar(currentDate);

  /* 🔥 오른쪽 승인대기 패널로 그대로 전달 */
  useEffect(() => {
    onUpdatePendingList?.(rawData || []);
  }, [rawData, onUpdatePendingList]);

  /* 🔥 월 이동 */
  const handlePrev = () => {
    setCurrentDate((prev) => {
      // 이전 달의 1일로 설정
      return new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
    });
  };

  const handleNext = () => {
    setCurrentDate((prev) => {
      // 다음 달의 1일로 설정
      
      return new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
    });
  };

  return (
    <Box
      height="100%"
      display="flex"
      flexDirection="column"
      border="1px solid #ddd"
      borderRadius="8px"
      p={4}
    >
      {/* 헤더 */}
      <Flex justify="space-between" align="center" mb={3}>
        <Button size="sm" onClick={handlePrev}>
          ◀
        </Button>

        <Text fontWeight="bold" fontSize="lg">
          {currentDate.getFullYear()}년{" "}
          {currentDate.getMonth() + 1}월
        </Text>

        <Button size="sm" onClick={handleNext}>
          ▶
        </Button>
      </Flex>

      {loading && <Spinner size="sm" mb={2} />}

      <CalendarView
        events={events}
        selectedDate={currentDate} // 🔥 추가: 캘린더 월 이동 동기화
        onEventClick={onSelectEvent}
      />
    </Box>
  );
}
