import { useState } from "react";
import { Badge, Box, Button, Flex, Heading, HStack, IconButton, Input, InputGroup, InputLeftElement, Select, SimpleGrid, Spinner, Text, VStack } from "@chakra-ui/react";
import { FiChevronLeft, FiChevronRight, FiSearch } from "react-icons/fi";
import { addDaysToDateValue, toLocalDateValue } from "../../../common/utils/dateValue";

const STATUSES = { ALL: "전체", DAY: "주간", NIGHT: "야간", OFF: "휴무", TRAINING: "교육" };
const COLORS = { DAY: "blue", NIGHT: "purple", OFF: "gray", TRAINING: "orange" };
const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function filterDayUsers(users, date, keyword, status) {
  const query = keyword.trim().toLowerCase();
  return users.flatMap((user) => {
    const items = (user.days?.[date] || []).filter((item) =>
      (status === "ALL" || item.status === status)
      && (!query || [user.user_name, item.work_place, item.work_place_detail].some((value) => value?.toLowerCase().includes(query)))
    );
    const unassigned = status === "ALL" && !(user.days?.[date] || []).length
      && (!query || user.user_name?.toLowerCase().includes(query));
    return items.length || unassigned ? [{ ...user, items }] : [];
  });
}

export default function BoardMobileSchedule({ schedule }) {
  const today = toLocalDateValue();
  const [chosen, setChosen] = useState(today);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const dates = Array.from({ length: 7 }, (_, index) => addDaysToDateValue(schedule.date, index));
  const selected = dates.includes(chosen) ? chosen : dates.includes(today) ? today : dates[0];
  const users = filterDayUsers(schedule.sourceData.users || [], selected, query, status);
  const day = new Date(`${selected}T00:00:00`);
  return <Box>
    <Heading fontSize="24px" letterSpacing="-0.8px">근무표 조회</Heading>
    <Text mt={2} mb={5} fontSize="sm" color="gray.500">하루의 근무를 빠르게 확인하세요</Text>
    <HStack spacing={2} mb={3}>
      <IconButton aria-label="이전 달" icon={<FiChevronLeft />} variant="ghost" onClick={() => schedule.moveMonth(-1)} />
      <Input aria-label="조회 월" type="month" value={schedule.selectedMonth} onChange={(e) => schedule.selectMonth(e.target.value)} minW={0} flex={1} bg="white" fontSize="16px" />
      <IconButton aria-label="다음 달" icon={<FiChevronRight />} variant="ghost" onClick={() => schedule.moveMonth(1)} />
      <Button flexShrink={0} variant="outline" bg="white" onClick={() => { schedule.goCurrentWeek(); setChosen(today); }}>오늘</Button>
    </HStack>
    <Select aria-label="조회 주차" bg="white" mb={3} value={schedule.date} onChange={(e) => { schedule.selectWeek(e.target.value); setChosen(e.target.value); }}>
      {schedule.monthWeeks.map((week, index) => <option key={week.start} value={week.start}>{index + 1}주차 · {week.start.slice(5).replace("-", ".")} – {week.end.slice(5).replace("-", ".")}</option>)}
    </Select>
    <SimpleGrid columns={7} spacing={1} mb={5}>
      {dates.map((date) => <Button key={date} aria-label={`${date} 조회`} aria-pressed={date === selected} h="66px" minW={0} px={0} borderRadius="xl" flexDirection="column" gap={2} bg={date === selected ? "blue.500" : "white"} color={date === selected ? "white" : "gray.600"} _hover={{ bg: date === selected ? "blue.600" : "blue.50" }} onClick={() => setChosen(date)}>
        <Text as="span" fontSize="xs">{DAYS[new Date(`${date}T00:00:00`).getDay()]}</Text><Text as="span" fontSize="lg">{Number(date.slice(8))}</Text>
      </Button>)}
    </SimpleGrid>
    <InputGroup mb={3}><InputLeftElement pointerEvents="none"><FiSearch /></InputLeftElement><Input aria-label="직원 또는 근무지 검색" placeholder="직원 또는 근무지 검색" value={query} onChange={(e) => setQuery(e.target.value)} bg="white" borderRadius="xl" h="44px" fontSize="16px" /></InputGroup>
    <Flex gap={2} wrap="wrap" mb={5}>{Object.entries(STATUSES).map(([value, label]) => <Button key={value} aria-pressed={value === status} size="sm" minH="40px" px={3} borderRadius="full" colorScheme={value === status ? "blue" : "gray"} variant={value === status ? "solid" : "outline"} bg={value === status ? undefined : "white"} onClick={() => setStatus(value)}>{label}</Button>)}</Flex>
    {schedule.loading ? <Flex justify="center" py={12} role="status"><Spinner mr={3} /><Text>근무표를 불러오는 중입니다.</Text></Flex> : schedule.error ? <Box bg="white" p={5} borderRadius="xl" role="alert"><Text mb={3}>근무표를 불러오지 못했습니다.</Text><Button onClick={schedule.search}>다시 시도</Button></Box> : <>
      <HStack justify="space-between" mb={3}><Text fontWeight="700" fontSize="sm">{day.getMonth() + 1}월 {day.getDate()}일 {DAYS[day.getDay()]}요일 {selected === today ? "· 오늘" : ""}</Text><Text color="gray.500" fontSize="sm">{users.length}명</Text></HStack>
      <VStack align="stretch" spacing={3} aria-live="polite">
        {users.map((user, index) => <Box key={user.user_uuid || index} bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.100">
          <HStack spacing={3} align="start"><Flex w="38px" h="38px" flexShrink={0} borderRadius="xl" bg="gray.100" color="gray.600" align="center" justify="center">{user.user_name?.slice(0, 1)}</Flex><Box minW={0} flex={1}><Text fontWeight="700">{user.user_name}</Text>
            {!user.items.length ? <Text mt={1} fontSize="sm" color="gray.500">등록된 근무 없음</Text> : user.items.map((item, i) => <Flex key={item.schedule_uuid || i} gap={2} align="start" justify="space-between" mt={i ? 3 : 1} pt={i ? 3 : 0} borderTopWidth={i ? "1px" : 0} borderColor="gray.100"><Box minW={0}><Text fontSize="sm" color="gray.600" overflowWrap="anywhere">{item.work_place || (item.status === "OFF" ? "배정 없음" : "근무지 미지정")}</Text>{item.work_place_detail && <Text mt={1} fontSize="xs" color="gray.500" overflowWrap="anywhere">{item.work_place_detail}</Text>}</Box><Badge flexShrink={0} colorScheme={COLORS[item.status] || "gray"} borderRadius="md" px={2} py={1}>{STATUSES[item.status] || item.status_label || item.status}</Badge></Flex>)}
          </Box></HStack>
        </Box>)}
        {!users.length && <Box textAlign="center" bg="white" py={10} px={4} borderRadius="xl"><Text color="gray.600">{query || status !== "ALL" ? "검색 조건에 맞는 근무가 없습니다." : "조회된 직원이 없습니다."}</Text></Box>}
      </VStack>
    </>}
  </Box>;
}
