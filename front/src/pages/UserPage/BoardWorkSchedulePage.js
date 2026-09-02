import { Badge, Button, HStack, Input, InputGroup, InputLeftElement, Select, Spinner, Text, VStack } from "@chakra-ui/react";
import { FiChevronLeft, FiChevronRight, FiSearch } from "react-icons/fi";

import BoardLayout from "../../features/board/layout/BoardLayout";
import BoardPageTitle from "../../features/board/components/BoardPageTitle";
import BoardWeekScheduleTable from "../../features/board/work_schedule/components/BoardWeekScheduleTable";
import useBoardWorkSchedule from "../../features/board/work_schedule/hook/useBoardWorkSchedule";
import { toLocalDateValue } from "../../features/common/utils/dateValue";

export default function BoardWorkSchedulePage(props) {
  const schedule = useBoardWorkSchedule();
  const dates = schedule.data.dates || [];
  const range = dates.length ? `${dates[0].slice(5).replace("-", ".")} — ${dates[dates.length - 1].slice(5).replace("-", ".")}` : "-";
  const searchPlaceholder = {
    user_name: "직원 이름 검색",
    work_place: "근무지 검색",
    work_place_detail: "세부 근무지 검색",
  }[schedule.searchType];

  return (
    <BoardLayout activeSection="work-schedule" {...props}>
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between" align={{ base: "stretch", lg: "flex-start" }} flexDirection={{ base: "column", lg: "row" }}>
          <VStack align="stretch" spacing={3}>
            <BoardPageTitle
              title="근무표 조회"
              badge="오늘 기준"
              description={`${range} · 직원 ${schedule.data.users.length}명 · 일정 ${schedule.scheduleCount}건`}
            />
            <HStack spacing={2.5} flexWrap="wrap">
              <Text fontSize="sm" fontWeight="700" color="gray.600" mr={1}>주차 선택</Text>
              {schedule.monthWeeks.map((week, index) => {
                const active = schedule.date === week.start;
                return (
                  <Button key={week.start} size="sm" minH="34px" px={3} colorScheme="blue" variant={active ? "solid" : "outline"} onClick={() => schedule.selectWeek(week.start)}>
                    {index + 1}주차
                    <Text as="span" ml={2} fontSize="10px" fontWeight="500" opacity={active ? 0.9 : 0.65}>
                      {week.start.slice(5).replace("-", ".")}–{week.end.slice(5).replace("-", ".")}
                    </Text>
                  </Button>
                );
              })}
            </HStack>
          </VStack>

          <VStack align={{ base: "stretch", lg: "flex-end" }} spacing={2}>
            <HStack spacing={3} flexWrap="wrap" justify={{ base: "flex-start", lg: "flex-end" }} fontSize="xs">
              <Badge colorScheme="green">● 주간</Badge>
              <Badge colorScheme="blue">● 야간</Badge>
              <Badge colorScheme="gray">● 휴무</Badge>
              <Badge colorScheme="orange">● 교육</Badge>
              {schedule.appliedKeyword && <Badge colorScheme="cyan">검색 · {schedule.appliedKeyword}</Badge>}
              {schedule.loading && <Spinner size="sm" />}
            </HStack>
            <HStack spacing={2} flexWrap="wrap" justify={{ base: "flex-start", lg: "flex-end" }}>
              <Button size="sm" variant="outline" aria-label="이전 달" onClick={() => schedule.moveMonth(-1)}><FiChevronLeft /></Button>
              <Input size="sm" type="month" w="145px" bg="white" value={schedule.selectedMonth} onChange={(event) => schedule.selectMonth(event.target.value)} />
              <Button size="sm" variant="outline" aria-label="다음 달" onClick={() => schedule.moveMonth(1)}><FiChevronRight /></Button>
              <Button size="sm" variant="outline" onClick={schedule.goCurrentWeek}>이번 주</Button>
            </HStack>
            <HStack spacing={2} flexWrap="wrap" justify={{ base: "flex-start", lg: "flex-end" }}>
              <Select size="sm" w="105px" bg="white" value={schedule.searchType} onChange={(event) => schedule.setSearchType(event.target.value)}>
                <option value="user_name">직원</option>
                <option value="work_place">근무지</option>
                <option value="work_place_detail">세부</option>
              </Select>
              <Select size="sm" w="120px" bg="white" value={schedule.status} onChange={(event) => schedule.setStatus(event.target.value)}>
                <option value="ALL">전체</option>
                <option value="DAY">주간</option>
                <option value="NIGHT">야간</option>
                <option value="OFF">휴무</option>
                <option value="TRAINING">교육</option>
              </Select>
              <InputGroup size="sm" w="220px">
                <InputLeftElement pointerEvents="none"><FiSearch color="#A0AEC0" /></InputLeftElement>
                <Input bg="white" placeholder={searchPlaceholder} value={schedule.keyword} onChange={(event) => schedule.setKeyword(event.target.value)} onKeyDown={(event) => event.key === "Enter" && schedule.search()} />
              </InputGroup>
              <Button size="sm" colorScheme="blue" onClick={schedule.search} isLoading={schedule.loading}>조회</Button>
            </HStack>
          </VStack>
        </HStack>

        <BoardWeekScheduleTable dates={dates} users={schedule.data.users} today={toLocalDateValue()} />
      </VStack>
    </BoardLayout>
  );
}
