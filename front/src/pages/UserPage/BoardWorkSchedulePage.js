import { Box, Button, Flex, HStack, IconButton, Input, InputGroup, InputLeftElement, Select, Text, VStack, useMediaQuery } from "@chakra-ui/react";
import BoardMobileSchedule from "../../features/board/work_schedule/components/BoardMobileSchedule";
import ScheduleDatePicker from "../../features/board/work_schedule/components/ScheduleDatePicker";
import { FiChevronLeft, FiChevronRight, FiSearch } from "react-icons/fi";
import BoardLayout from "../../features/board/layout/BoardLayout";
import BoardPageTitle from "../../features/board/components/BoardPageTitle";
import BoardWeekScheduleTable from "../../features/board/work_schedule/components/BoardWeekScheduleTable";
import useBoardWorkSchedule from "../../features/board/work_schedule/hook/useBoardWorkSchedule";
import { addDaysToDateValue, toLocalDateValue } from "../../features/common/utils/dateValue";

export default function BoardWorkSchedulePage(props) {
  const [mobile] = useMediaQuery("(max-width: 47.99em)", { ssr: false });
  const schedule = useBoardWorkSchedule({ enabled: !mobile });
  const searchPlaceholder = { user_name: "직원 이름 검색", work_place: "근무지 검색", work_place_detail: "세부 근무지 검색" }[schedule.searchType];
  const range = `${schedule.date.replaceAll("-", ".")} – ${addDaysToDateValue(schedule.date, 6).slice(5).replace("-", ".")}`;
  return <BoardLayout activeSection="work-schedule" {...props}>
    {mobile ? <BoardMobileSchedule schedule={schedule} /> : <VStack align="stretch" spacing={3} h="100%" minH="480px">
      <BoardPageTitle title="근무표 조회" />
      <Flex gap={3} justify="space-between" wrap="wrap" bg="white" p={3} borderWidth="1px" borderColor="gray.200" borderRadius="lg">
        <HStack spacing={2} flexWrap="wrap">
          <Select aria-label="검색 대상" size="sm" w="90px" value={schedule.searchType} onChange={(e) => schedule.setSearchType(e.target.value)}><option value="user_name">직원</option><option value="work_place">근무지</option><option value="work_place_detail">세부</option></Select>
          <Select aria-label="근무 상태" size="sm" w="105px" value={schedule.status} onChange={(e) => schedule.setStatus(e.target.value)}><option value="ALL">전체 상태</option><option value="DAY">주간</option><option value="NIGHT">야간</option><option value="OFF">휴무</option><option value="TRAINING">교육</option></Select>
          <InputGroup size="sm" w="180px"><InputLeftElement pointerEvents="none"><FiSearch /></InputLeftElement><Input placeholder={searchPlaceholder} value={schedule.keyword} onChange={(e) => schedule.setKeyword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && schedule.search()} /></InputGroup>
          <Button size="sm" colorScheme="blue" onClick={schedule.search} isLoading={schedule.loading}>조회</Button>
          <Button size="sm" variant="outline" onClick={schedule.resetFilters} isDisabled={schedule.loading}>초기화</Button>
        </HStack>
        <HStack spacing={2} ml="auto">
          <IconButton size="sm" variant="outline" aria-label="이전 주" icon={<FiChevronLeft />} onClick={() => schedule.selectDate(addDaysToDateValue(schedule.date, -7))} />
          <ScheduleDatePicker month={schedule.selectedMonth} selectedDate={schedule.selectedDate} onSelect={schedule.selectDate} label={range} />
          <IconButton size="sm" variant="outline" aria-label="다음 주" icon={<FiChevronRight />} onClick={() => schedule.selectDate(addDaysToDateValue(schedule.date, 7))} />
          <Button size="sm" variant="outline" onClick={schedule.goCurrentWeek}>이번 주</Button>
        </HStack>
      </Flex>
      {schedule.error && <Box role="alert" color="red.600"><Text>근무표를 불러오지 못했습니다. 다시 조회해 주세요.</Text></Box>}
      <BoardWeekScheduleTable dates={schedule.data.dates} users={schedule.data.users} today={toLocalDateValue()} selectedDate={schedule.selectedDate} loading={schedule.loading} />
    </VStack>}
  </BoardLayout>;
}
