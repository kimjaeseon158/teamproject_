import { Badge, Box, Button, Flex, Heading, HStack, IconButton, Input, InputGroup, InputLeftElement, Select, Spinner, Text, VStack } from "@chakra-ui/react";
import { FiChevronLeft, FiChevronRight, FiSearch } from "react-icons/fi";
import { addDaysToDateValue, toLocalDateValue } from "../../../common/utils/dateValue";
import TodayButton from "../../../common/TodayButton";
import ScheduleDatePicker from "./ScheduleDatePicker";
import { getAutomaticSpecialDay } from "../../../../common/holidayCalendar";
import { getScheduleStatus, SCHEDULE_STATUSES } from "../../../admin/work_schedule/constants/scheduleStatus";

const STATUSES = { ALL: "전체", ...Object.fromEntries(SCHEDULE_STATUSES.map((status) => [status.value, status.label])) };
const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const SEARCH_PLACEHOLDERS = {
  user_name: "직원 이름 검색",
  work_place: "근무지 검색",
  work_place_detail: "세부 근무지 검색",
};

export default function BoardMobileSchedule({ schedule, showTitle = true }) {
  const today = toLocalDateValue();
  const range = `${schedule.date.replaceAll("-", ".")} – ${addDaysToDateValue(schedule.date, 6).slice(5).replace("-", ".")}`;
  const visibleDays = (schedule.data.dates || []).map((date) => ({
    date,
    users: (schedule.data.users || []).map((user) => ({
      ...user,
      items: user.days?.[date] || [],
    })).filter((user) => user.items.length),
  }));

  return <Box>
    {showTitle && <Heading fontSize="24px" letterSpacing="-0.8px">근무표</Heading>}

    <HStack my={3} spacing={2}>
      <IconButton flexShrink={0} size="sm" variant="outline" bg="white" aria-label="이전 주" icon={<FiChevronLeft />} onClick={() => schedule.selectDate(addDaysToDateValue(schedule.date, -7))} />
      <Box flex="1" minW={0} sx={{ "button": { width: "100%" } }}>
        <ScheduleDatePicker month={schedule.selectedMonth} selectedDate={schedule.selectedDate} onSelect={schedule.selectDate} label={range} />
      </Box>
      <IconButton flexShrink={0} size="sm" variant="outline" bg="white" aria-label="다음 주" icon={<FiChevronRight />} onClick={() => schedule.selectDate(addDaysToDateValue(schedule.date, 7))} />
      <TodayButton flexShrink={0} size="sm" tooltip="오늘이 포함된 주로 이동" onClick={schedule.goCurrentWeek} />
    </HStack>

    <Flex gap={2} mb={3}>
      <Select aria-label="검색 대상" w="104px" bg="white" value={schedule.searchType} onChange={(event) => schedule.setSearchType(event.target.value)}>
        <option value="user_name">직원</option>
        <option value="work_place">근무지</option>
        <option value="work_place_detail">세부</option>
      </Select>
      <InputGroup flex="1">
        <InputLeftElement pointerEvents="none"><FiSearch /></InputLeftElement>
        <Input aria-label={SEARCH_PLACEHOLDERS[schedule.searchType]} placeholder={SEARCH_PLACEHOLDERS[schedule.searchType]} value={schedule.keyword} onChange={(event) => schedule.setKeyword(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") schedule.search(); }} bg="white" />
      </InputGroup>
      <Button colorScheme="blue" onClick={schedule.search} isLoading={schedule.loading}>조회</Button>
    </Flex>

    <Flex gap={2} wrap="wrap" mb={3}>
      {Object.entries(STATUSES).map(([value, label]) => <Button key={value} aria-pressed={value === schedule.status} size="sm" minH="34px" px={3} borderRadius="full" colorScheme={value === schedule.status ? "blue" : "gray"} variant={value === schedule.status ? "solid" : "outline"} onClick={() => schedule.setStatus(value)}>{label}</Button>)}
      <Button size="sm" minH="34px" px={3} borderRadius="full" variant="ghost" onClick={schedule.resetFilters} isDisabled={schedule.loading}>초기화</Button>
    </Flex>

    {schedule.loading ? <Flex justify="center" py={12} role="status"><Spinner mr={3} /><Text>주간 근무표를 불러오는 중입니다.</Text></Flex> : schedule.error ? <Box bg="white" p={5} borderRadius="xl" role="alert"><Text mb={3}>근무표를 불러오지 못했습니다.</Text><Button onClick={schedule.search}>다시 시도</Button></Box> : <VStack align="stretch" spacing={4} aria-live="polite">
      {!visibleDays.some(({ users }) => users.length) && <Text py={6} textAlign="center" color="gray.500">검색 조건에 맞는 근무가 없습니다.</Text>}
      {visibleDays.map(({ date, users }) => {
        const day = new Date(`${date}T00:00:00`);
        const holiday = getAutomaticSpecialDay(date);
        return <Box key={date} as="section" aria-label={`${date} 근무`}>
          <HStack justify="space-between" mb={2}>
            <Box>
              <Text fontWeight="700" fontSize="sm" color={holiday.isHoliday || day.getDay() === 0 ? "red.500" : day.getDay() === 6 ? "blue.500" : "gray.800"}>{day.getMonth() + 1}월 {day.getDate()}일 {DAYS[day.getDay()]}요일 {date === today ? "· 오늘" : ""}</Text>
              {holiday.isHoliday && <Text fontSize="xs" color="red.500">{holiday.name || "공휴일"}</Text>}
            </Box>
            <Text color="gray.500" fontSize="sm">{users.length}명</Text>
          </HStack>
          <VStack align="stretch" spacing={2}>
            {users.map((user) => <Box key={user.user_uuid} bg="white" p={3} borderRadius="xl" borderWidth="1px" borderColor="gray.100">
              <Text fontWeight="700">{user.user_name}</Text>
              {user.items.map((item, index) => {
                const statusMeta = getScheduleStatus(item.status);
                return <Flex key={item.schedule_uuid || index} mt={2} gap={2} align="start" justify="space-between">
                  <Box minW={0}>
                    <Text fontSize="sm" color="gray.600" overflowWrap="anywhere">{item.work_place || (item.status === "OFF" ? "배정 없음" : "근무지 미지정")}</Text>
                    {item.work_place_detail && <Text fontSize="xs" color="gray.500" overflowWrap="anywhere">{item.work_place_detail}</Text>}
                  </Box>
                  <Badge flexShrink={0} colorScheme={statusMeta.colorScheme}>{item.status_label || statusMeta.label}</Badge>
                </Flex>;
              })}
            </Box>)}
            {!users.length && <Text bg="white" px={3} py={2} borderRadius="xl" fontSize="sm" color="gray.500">등록된 근무가 없습니다.</Text>}
          </VStack>
        </Box>;
      })}
    </VStack>}
  </Box>;
}
