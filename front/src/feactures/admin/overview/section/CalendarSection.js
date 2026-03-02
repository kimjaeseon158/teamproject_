import { Box, Flex, Button, Text, Spinner } from "@chakra-ui/react";
import { useEffect, useState, useMemo } from "react";
import CalendarView from "../../../../common/CalendarView";
import useApproveCalendar from "../hook/useApproveCalendar";

export default function CalendarSection({
  onUpdatePendingList,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { events, loading, rawData } =
    useApproveCalendar(currentDate);

  /* 🔥 오른쪽 승인대기 패널로 그대로 전달 */
  useEffect(() => {
    onUpdatePendingList?.(rawData || []);
  }, [rawData, onUpdatePendingList]);

  /* 🔥 rawData 기준 날짜별 집계 생성 */
  const daySummaryMap = useMemo(() => {
    const map = {};

    (rawData || []).forEach((item) => {
      if (!item.work_date) return;

      const date = item.work_date; // 🔥 반드시 work_date 그대로 사용

      if (!map[date]) {
        map[date] = {
          day: 0,
          night: 0,
          special: 0,
        };
      }

      if (item.work_shift === "주간") map[date].day += 1;
      if (item.work_shift === "야간") map[date].night += 1;
      if (item.work_shift === "특근") map[date].special += 1;
    });

    return map;
  }, [rawData]);

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
        daySummaryMap={daySummaryMap}   
      />
    </Box>
  );
}