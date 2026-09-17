import { Box, Button, HStack, IconButton, SimpleGrid, Text } from "@chakra-ui/react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { monthDates, shiftMonth } from "../utils/monthSchedule";
import { toLocalDateValue } from "../../../common/utils/dateValue";

export default function WorkScheduleMonthCalendar({ month, selectedDate, onMonthChange, onDateSelect, onToday }) {
  const dates = monthDates(month);
  const offset = dates.length ? (new Date(`${dates[0]}T00:00:00`).getDay() + 6) % 7 : 0;
  const today = toLocalDateValue();
  return <Box bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="xl" p={3} w="100%" maxW={{ base: "100%", md: "360px" }}>
    <HStack justify="space-between" mb={2}>
      <IconButton size="sm" variant="ghost" aria-label="근무표 이전 달" icon={<FiChevronLeft />} onClick={() => onMonthChange(shiftMonth(month, -1))} />
      <Text fontWeight="700" aria-live="polite">{month.replace("-", "년 ")}월</Text>
      <Button size="xs" variant="outline" onClick={onToday}>오늘</Button>
      <IconButton size="sm" variant="ghost" aria-label="근무표 다음 달" icon={<FiChevronRight />} onClick={() => onMonthChange(shiftMonth(month, 1))} />
    </HStack>
    <SimpleGrid columns={7} spacing={1}>
      {["월", "화", "수", "목", "금", "토", "일"].map((label, i) => <Text key={label} textAlign="center" fontSize="xs" color={i === 6 ? "red.500" : "gray.500"}>{label}</Text>)}
      {Array.from({ length: offset }, (_, i) => <Box key={`empty-${i}`} />)}
      {dates.map((date) => <Button key={date} minW={0} h="36px" px={0} size="sm" aria-label={`${date} 근무표 조회`} aria-pressed={selectedDate === date} colorScheme={selectedDate === date ? "blue" : "gray"} variant={selectedDate === date ? "solid" : "ghost"} borderWidth={date === today ? "1px" : 0} borderColor="blue.400" onClick={() => onDateSelect(date)}>{Number(date.slice(8))}</Button>)}
    </SimpleGrid>
  </Box>;
}
