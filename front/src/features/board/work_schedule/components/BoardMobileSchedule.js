import { useState } from "react";
import { Badge, Box, Button, Checkbox, Flex, Heading, HStack, Input, InputGroup, InputLeftElement, Spinner, Text, VStack } from "@chakra-ui/react";
import { FiSearch } from "react-icons/fi";
import { toLocalDateValue } from "../../../common/utils/dateValue";
import ScheduleDatePicker from "./ScheduleDatePicker";
import useMonthWorkSchedule from "../hook/useMonthWorkSchedule";
import { filterDateUsers, monthDates } from "../utils/monthSchedule";

const STATUSES = { ALL: "전체", DAY: "주간", NIGHT: "야간", OFF: "휴무", TRAINING: "교육" };
const COLORS = { DAY: "green", NIGHT: "blue", OFF: "gray", TRAINING: "orange" };
const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

export const filterDayUsers = filterDateUsers;

export default function BoardMobileSchedule({ schedule }) {
  const today = toLocalDateValue();
  const [chosen, setChosen] = useState(today);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [onlyScheduled, setOnlyScheduled] = useState(false);
  const [month, setMonth] = useState(today.slice(0, 7));
  const monthly = useMonthWorkSchedule(month);
  const selected = chosen?.startsWith(month) ? chosen : null;
  const dates = selected ? [selected] : monthDates(month);
  const changeMonth = (next) => { setChosen(null); setMonth(next); schedule.selectMonth(next); };
  const visibleDays = dates.map((date) => ({ date, users: filterDateUsers(monthly.data.users, date, query, status) })).filter(({ users }) => !onlyScheduled || selected || users.length);
  const chooseDate = (date) => { setMonth(date.slice(0, 7)); schedule.selectMonth(date.slice(0, 7)); setChosen(date); };
  return <Box>
    <Heading fontSize="24px" letterSpacing="-0.8px">근무표 조회</Heading>
    <Box my={3}>
      <ScheduleDatePicker month={month} selectedDate={selected} onSelect={chooseDate} onMonthSelect={changeMonth} label={selected ? `${selected.replaceAll("-", ".")} (${DAYS[new Date(selected + "T00:00:00").getDay()]})${selected === today ? " · 오늘" : ""}` : month.replace("-", "년 ") + "월 · 월 전체"} />
    </Box>
    <InputGroup mb={3}><InputLeftElement pointerEvents="none"><FiSearch /></InputLeftElement><Input aria-label="직원 또는 근무지 검색" placeholder="직원 또는 근무지 검색" value={query} onChange={(e) => setQuery(e.target.value)} bg="white" borderRadius="xl" h="44px" fontSize="16px" /></InputGroup>
    <Flex gap={2} wrap="wrap" mb={2}>{Object.entries(STATUSES).map(([value, label]) => <Button key={value} aria-pressed={value === status} size="sm" minH="34px" px={3} borderRadius="full" colorScheme={value === status ? "blue" : "gray"} variant={value === status ? "solid" : "outline"} onClick={() => setStatus(value)}>{label}</Button>)}</Flex>
    {!selected && <Checkbox mb={3} size="sm" isChecked={onlyScheduled} onChange={(e) => setOnlyScheduled(e.target.checked)}>근무 있는 날짜만</Checkbox>}
    {monthly.loading ? <Flex justify="center" py={12} role="status"><Spinner mr={3} /><Text>월간 근무표를 불러오는 중입니다.</Text></Flex> : monthly.error ? <Box bg="white" p={5} borderRadius="xl" role="alert"><Text mb={3}>월 전체 근무표를 불러오지 못했습니다.</Text><Button onClick={monthly.reload}>다시 시도</Button></Box> : <VStack align="stretch" spacing={3} aria-live="polite">
      {!visibleDays.length && <Text py={6} textAlign="center" color="gray.500">검색 조건에 맞는 근무가 없습니다.</Text>}
      {visibleDays.map(({ date, users }) => {
        const day = new Date(date + "T00:00:00");
        return <Box key={date} as="section" aria-label={date + " 근무"}>
          <HStack justify="space-between" mb={2}><Text fontWeight="700" fontSize="sm">{day.getMonth() + 1}월 {day.getDate()}일 {DAYS[day.getDay()]}요일 {date === today ? "· 오늘" : ""}</Text><Text color="gray.500" fontSize="sm">{users.length}명</Text></HStack>
          <VStack align="stretch" spacing={2}>
            {users.map((user) => <Box key={user.user_uuid} bg="white" p={3} borderRadius="xl" borderWidth="1px" borderColor="gray.100">
              <Text fontWeight="700">{user.user_name}</Text>
              {user.items.map((item, index) => <Flex key={item.schedule_uuid || index} mt={2} gap={2} align="start" justify="space-between"><Box minW={0}><Text fontSize="sm" color="gray.600" overflowWrap="anywhere">{item.work_place || (item.status === "OFF" ? "배정 없음" : "근무지 미지정")}</Text>{item.work_place_detail && <Text fontSize="xs" color="gray.500" overflowWrap="anywhere">{item.work_place_detail}</Text>}</Box><Badge flexShrink={0} colorScheme={COLORS[item.status] || "gray"}>{STATUSES[item.status] || item.status_label}</Badge></Flex>)}
            </Box>)}
            {!users.length && <Text bg="white" px={3} py={2} borderRadius="xl" fontSize="sm" color="gray.500">{query || status !== "ALL" ? "검색 조건에 맞는 근무가 없습니다." : "등록된 근무가 없습니다."}</Text>}
          </VStack>
        </Box>;
      })}
    </VStack>}
  </Box>;
}
