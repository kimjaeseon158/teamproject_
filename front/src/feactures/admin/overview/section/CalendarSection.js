import { Box, Flex, Button, Text, Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import CalendarView from "../../../../common/CalendarView";
import useApproveCalendar from "../hook/useApproveCalendar";

export default function CalendarSection({
  onUpdatePendingList,
  onSelectEvent,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { events, loading, rawData } =
    useApproveCalendar(currentDate);

  /* 🔥 오른쪽 승인대기 패널로 그대로 전달 */
  useEffect(() => {
    onUpdatePendingList?.(rawData || []);
  }, [rawData, onUpdatePendingList]);

  /* 🔥 월 이동 */
  const handlePrev = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNext = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
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
        onEventClick={onSelectEvent}
      />
    </Box>
  );
}
