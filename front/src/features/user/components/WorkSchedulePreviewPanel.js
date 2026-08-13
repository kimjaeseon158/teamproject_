import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  SimpleGrid,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  useBreakpointValue,
  useToast,
} from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";
import { FiChevronLeft, FiChevronRight, FiSearch } from "react-icons/fi";

import { fetchUserWorkSchedule } from "../api/userWorkSchedule";
import { addDaysToDateValue, toLocalDateValue } from "../../common/utils/dateValue";

const statusColor = { DAY: "green", NIGHT: "blue", OFF: "gray", TRAINING: "orange" };
const PAGE_SIZE = 8;
const getMonthValue = (dateValue) => dateValue?.slice(0, 7) || "";
const getMonthWeeks = (monthValue) => {
  if (!monthValue) return [];
  const [year, month] = monthValue.split("-").map(Number);
  const firstDay = `${monthValue}-01`;
  const lastDay = toLocalDateValue(new Date(year, month, 0));
  const firstWeekday = new Date(`${firstDay}T00:00:00`).getDay();
  const daysToMonday = (8 - firstWeekday) % 7;
  const firstMonday = addDaysToDateValue(firstDay, daysToMonday);
  const weeks = [];
  for (let monday = firstMonday; monday <= lastDay; monday = addDaysToDateValue(monday, 7)) {
    weeks.push({ start: monday, end: addDaysToDateValue(monday, 6) });
  }
  return weeks;
};
const addMonths = (monthValue, amount) => {
  const [year, month] = monthValue.split("-").map(Number);
  return toLocalDateValue(new Date(year, month - 1 + amount, 1)).slice(0, 7);
};

function ScheduleItems({ items, compact = false, dark = false, horizontal = false }) {
  if (!items.length) return <Text fontSize="xs" color="gray.400">-</Text>;
  const Container = horizontal && items.length > 1 ? SimpleGrid : VStack;
  const containerProps = horizontal && items.length > 1
    ? { columns: 2, spacing: 1 }
    : { align: "stretch", spacing: compact ? 1 : 2 };
  return (
    <Container {...containerProps}>
      {items.map((item, index) => (
        <Box
          key={`${item.status}-${item.work_place}-${item.work_place_detail}-${index}`}
          px={horizontal && items.length > 1 ? 1.5 : compact ? 1.5 : 2}
          py={horizontal ? 1.5 : compact ? 1 : 2}
          borderRadius="md"
          bg={dark
            ? ({ DAY: "#4a3a18", NIGHT: "#12345a", OFF: "#29313b", TRAINING: "#173f31" }[item.status] || "#29313b")
            : compact ? "transparent" : `${statusColor[item.status] || "gray"}.50`}
          color={dark ? "white" : undefined}
          minW={0}
          minH={dark ? "62px" : horizontal ? "58px" : undefined}
          display={dark ? "flex" : undefined}
          flexDirection={dark ? "column" : undefined}
          justifyContent={dark ? "center" : undefined}
          textAlign={dark ? "center" : undefined}
          title={!dark ? [item.status_label, item.work_place, item.work_place_detail].filter(Boolean).join(" · ") : undefined}
        >
          {dark ? (
            <>
              <Text fontSize="sm" fontWeight="900">{item.status_label}</Text>
              <Text mt={1} fontSize="xs" color="whiteAlpha.800" noOfLines={1}>
                {[item.work_place, item.work_place_detail].filter(Boolean).join(" ") || "-"}
              </Text>
            </>
          ) : compact ? (
            <>
              <HStack spacing={1.5} minW={0}>
                <Badge colorScheme={statusColor[item.status] || "gray"} fontSize="9px" px={1}>{item.status_label}</Badge>
                <Text fontSize="11px" fontWeight="800" noOfLines={1}>{item.work_place || "-"}</Text>
              </HStack>
              {item.work_place_detail && <Text mt={0.5} fontSize="12px" lineHeight="1.35" color="gray.700" fontWeight="600" noOfLines={2}>{item.work_place_detail}</Text>}
            </>
          ) : (
            <>
              <HStack spacing={2} minW={0} align="center">
                <Badge flex="0 0 auto" minW="30px" textAlign="center" px={1.5} py={0.5} colorScheme={statusColor[item.status] || "gray"} fontSize="11px" lineHeight="1.2">{item.status_label}</Badge>
                {item.work_place && <Text minW={0} fontSize="13px" lineHeight="1.25" fontWeight="800" noOfLines={1}>{item.work_place}</Text>}
              </HStack>
              {item.work_place_detail && <Text mt={1.5} pt={1} borderTopWidth="1px" borderColor={`${statusColor[item.status] || "gray"}.200`} fontSize="12px" lineHeight="1.4" color="gray.700" fontWeight="600" noOfLines={2}>{item.work_place_detail}</Text>}
            </>
          )}
        </Box>
      ))}
    </Container>
  );
}

const getDayMeta = (target, today) => {
  const day = new Date(`${target}T00:00:00`).getDay();
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][day];
  const prefix = target === today ? "오늘 · " : "";
  return {
    label: `${prefix}${weekday} ${target.slice(5).replace("-", "/")}`,
    bg: target === today ? "cyan.50" : "gray.50",
    color: target === today ? "cyan.800" : day === 0 ? "red.600" : day === 6 ? "blue.600" : "gray.700",
  };
};

function DesktopTable({ dates, users }) {
  const today = toLocalDateValue();
  return (
    <Box overflowX="auto" borderWidth="1px" borderRadius="lg">
      <Table size="sm" minW="1180px" sx={{ tableLayout: "fixed" }}>
        <Thead bg="gray.100">
          <Tr>
             <Th w="140px">직원</Th>
            {dates.map((date) => {
              const meta = getDayMeta(date, today);
              const baseline = date === today;
              return <Th key={date} textAlign="center" color={meta.color} bg={meta.bg} borderTopWidth={baseline ? "3px" : undefined} borderLeftWidth={baseline ? "2px" : undefined} borderRightWidth={baseline ? "2px" : undefined} borderColor={baseline ? "cyan.400" : undefined}>{meta.label}</Th>;
            })}
          </Tr>
        </Thead>
        <Tbody>
          {users.map((user, userIndex) => {
            return (
              <Tr key={`${user.user_name}-${userIndex}`} _hover={{ bg: "gray.50" }}>
                <Td fontWeight="900">{user.user_name}</Td>
                {dates.map((date) => {
                  const baseline = date === today;
                  return (
                    <Td key={date} p={1.5} h="72px" verticalAlign="middle" bg={baseline ? "cyan.50" : "white"} borderLeftWidth={baseline ? "2px" : undefined} borderRightWidth={baseline ? "2px" : undefined} borderColor={baseline ? "cyan.300" : undefined}>
                       <ScheduleItems items={user.days?.[date] || []} horizontal />
                    </Td>
                  );
                })}
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Box>
  );
}

function Pagination({ currentPage, totalPages, totalCount, onChange }) {
  if (totalPages <= 1) return null;
  return <HStack justify="center" py={3} borderTopWidth="1px" position="relative">
    <Text position="absolute" left={4} fontSize="xs" color="gray.500">{(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, totalCount)} / {totalCount}명</Text>
    <Button size="sm" variant="ghost" isDisabled={currentPage === 1} onClick={() => onChange(currentPage - 1)}>이전</Button>
    {Array.from({ length: totalPages }, (_, index) => index + 1).slice(Math.max(0, currentPage - 3), Math.max(5, currentPage + 2)).map((page) => <Button key={page} size="sm" minW="32px" px={2} colorScheme="blue" variant={page === currentPage ? "solid" : "ghost"} onClick={() => onChange(page)}>{page}</Button>)}
    <Button size="sm" variant="ghost" isDisabled={currentPage === totalPages} onClick={() => onChange(currentPage + 1)}>다음</Button>
  </HStack>;
}

function MobileCards({ dates, selectedDate, users }) {
  return <VStack align="stretch" spacing={3}>{users.map((user, userIndex) => (
    <Box key={`${user.user_name}-${userIndex}`} borderWidth="1px" borderRadius="lg" overflow="hidden">
      <Text px={4} py={3} fontWeight="900" bg="gray.50">{user.user_name}</Text>
      <VStack p={3} align="stretch">{dates.map((date) => {
        const meta = getDayMeta(date, selectedDate);
        return <HStack key={date} align="flex-start" p={2} borderRadius="md" bg={meta.bg}><Text minW="104px" fontSize="sm" fontWeight="800" color={meta.color}>{meta.label}</Text><Box flex={1}><ScheduleItems items={user.days?.[date] || []} /></Box></HStack>;
      })}</VStack>
    </Box>
  ))}</VStack>;
}

export default function WorkSchedulePreviewPanel({ isOpen, onClose, selectedDate }) {
  const toast = useToast();
  const placement = useBreakpointValue({ base: "bottom", md: "right" });
  const isMobile = placement === "bottom";
  const [date, setDate] = useState(selectedDate?.formatted || toLocalDateValue());
  const [data, setData] = useState({ dates: [], users: [] });
  const [searchType, setSearchType] = useState("user_name");
  const [keyword, setKeyword] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(getMonthValue(selectedDate?.formatted || toLocalDateValue()));

  const load = useCallback(async (targetDate, filterType = "", filterKeyword = "") => {
    if (!targetDate) return;
    setLoading(true);
    try {
      const filters = {
        date: targetDate,
        ...(filterType && filterKeyword.trim()
          ? { [filterType]: filterKeyword.trim() }
          : {}),
      };
      const response = await fetchUserWorkSchedule(
          {
            ...filters,
          },
          { toast }
        );
      setData(response || { dates: [], users: [] });
      setAppliedKeyword(filterKeyword.trim());
      setCurrentPage(1);
    } catch (error) {
      toast({ title: "근무표 조회에 실패했습니다.", description: error.message, status: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const nextDate = selectedDate?.formatted || toLocalDateValue();
    setDate(nextDate);
    setSelectedMonth(getMonthValue(nextDate));
    setKeyword("");
    setAppliedKeyword("");
    if (isOpen) load(nextDate);
  }, [isOpen, load, selectedDate?.formatted]);

  const displayedDates = useMemo(() => data.dates || [], [data.dates]);
  const visibleUsers = useMemo(() => {
    const users = data.users || [];
    if (statusFilter === "ALL") return users;
    return users.filter((user) => displayedDates.some((target) =>
      (user.days?.[target] || []).some((schedule) => schedule.status === statusFilter)
    ));
  }, [data.users, displayedDates, statusFilter]);
  const scheduleCount = useMemo(() => visibleUsers.reduce(
    (count, user) => count + displayedDates.reduce(
      (dayCount, target) => dayCount + (user.days?.[target] || []).length,
      0
    ),
    0
  ), [displayedDates, visibleUsers]);
  const rangeLabel = `${displayedDates[0]?.slice(5).replace("-", ".")} — ${displayedDates[6]?.slice(5).replace("-", ".")}`;
  const totalPages = Math.max(1, Math.ceil(visibleUsers.length / PAGE_SIZE));
  const monthWeeks = useMemo(() => getMonthWeeks(selectedMonth), [selectedMonth]);
  const pagedUsers = useMemo(() => visibleUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE), [currentPage, visibleUsers]);

  useEffect(() => { setCurrentPage(1); }, [statusFilter]);
  useEffect(() => { setCurrentPage((page) => Math.min(page, totalPages)); }, [totalPages]);

  const handleSearch = () => {
    load(date, searchType, keyword);
  };
  const selectMonth = (monthValue) => {
    const firstMonday = getMonthWeeks(monthValue)[0]?.start;
    if (!firstMonday) return;
    setSelectedMonth(monthValue);
    setDate(firstMonday);
    load(firstMonday, searchType, keyword);
  };
  const selectWeek = (weekStart) => {
    setDate(weekStart);
    load(weekStart, searchType, keyword);
  };
  const moveMonth = (amount) => selectMonth(addMonths(selectedMonth, amount));
  const moveToCurrentWeek = () => {
    const today = toLocalDateValue();
    const weekday = new Date(`${today}T00:00:00`).getDay();
    const monday = addDaysToDateValue(today, -((weekday + 6) % 7));
    setSelectedMonth(getMonthValue(today));
    selectWeek(monday);
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement={placement || "right"} size="full">
      <DrawerOverlay />
      <DrawerContent bg="white" color="gray.800" maxH={isMobile ? "92dvh" : undefined} borderTopRadius={isMobile ? "24px" : undefined}>
        <DrawerCloseButton top={4} right={4} />
        <DrawerHeader borderBottomWidth="1px" borderColor="gray.200">근무표 조회</DrawerHeader>
        <DrawerBody px={{ base: 4, md: 6 }} py={5}>
          <VStack align="stretch" spacing={4}>
            {isMobile ? (
              <>
                <HStack justify="center" flexWrap="wrap">
                <Button aria-label="이전 달" variant="outline" onClick={() => moveMonth(-1)}><FiChevronLeft /></Button>
                <Text minW={{ base: "160px", md: "260px" }} textAlign="center" fontSize={{ base: "lg", md: "2xl" }} fontWeight="900">{rangeLabel}</Text>
                <Button aria-label="다음 달" variant="outline" onClick={() => moveMonth(1)}><FiChevronRight /></Button>
                <Button variant="outline" onClick={moveToCurrentWeek}>이번 주</Button>
                <Input type="month" value={selectedMonth} onChange={(event) => selectMonth(event.target.value)} maxW="160px" bg="white" />
                <Select maxW="190px" value={data.week_start || date} onChange={(event) => selectWeek(event.target.value)} bg="white">
                  {monthWeeks.map((week, index) => <option key={week.start} value={week.start}>{index + 1}주차 · {week.start.slice(5)}~{week.end.slice(5)}</option>)}
                </Select>
              </HStack>
                <HStack align="stretch" flexDirection="column">
                  <Select value={searchType} onChange={(event) => setSearchType(event.target.value)} bg="white">
                    <option value="user_name">전체 직원</option>
                    <option value="work_place">전체 근무지</option>
                    <option value="work_place_detail">세부 근무지</option>
                  </Select>
                  <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} bg="white">
                    <option value="ALL">전체 상태</option>
                    <option value="DAY">주간</option>
                    <option value="NIGHT">야간</option>
                    <option value="OFF">휴무</option>
                    <option value="TRAINING">교육</option>
                  </Select>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none"><FiSearch color="#A0AEC0" /></InputLeftElement>
                    <Input value={keyword} onChange={(event) => setKeyword(event.target.value)} onKeyDown={(event) => event.key === "Enter" && handleSearch()} placeholder="검색어를 입력하세요" />
                  </InputGroup>
                  <Button leftIcon={<RepeatIcon />} colorScheme="blue" onClick={handleSearch} isLoading={loading}>조회</Button>
                </HStack>
                <Text fontSize="sm" color="gray.500">직원 {visibleUsers.length}명 · 일정 {scheduleCount}건</Text>
                {appliedKeyword && <Badge alignSelf="flex-start" colorScheme="blue">검색어 · {appliedKeyword}</Badge>}
              </>
            ) : (
              <>
                <HStack justify="space-between" align="flex-end" spacing={4} flexWrap="wrap">
                  <Box flex="0 0 auto"><HStack><Text fontSize="lg" fontWeight="900">주간 근무표</Text><Badge colorScheme="cyan">오늘 기준</Badge></HStack><Text mt={1} fontSize="sm" color="gray.500">{rangeLabel} · 직원 {visibleUsers.length}명 · 일정 {scheduleCount}건</Text></Box>
                  <HStack spacing={2} flex="1" justify="flex-end" flexWrap="wrap">
                    <HStack spacing={0} borderWidth="1px" borderRadius="md" overflow="hidden" bg="white">
                      <Button size="sm" borderRadius="0" variant="ghost" aria-label="이전 달" onClick={() => moveMonth(-1)}><FiChevronLeft /></Button>
                      <Input size="sm" type="month" value={selectedMonth} onChange={(event) => selectMonth(event.target.value)} w="135px" borderWidth="0" borderLeftWidth="1px" borderRightWidth="1px" borderRadius="0" />
                      <Button size="sm" borderRadius="0" variant="ghost" aria-label="다음 달" onClick={() => moveMonth(1)}><FiChevronRight /></Button>
                    </HStack>
                    <Button size="sm" variant="outline" onClick={moveToCurrentWeek}>이번 주</Button>
                    <HStack spacing={0} borderWidth="1px" borderRadius="md" overflow="hidden" bg="white">
                      <Select size="sm" w="90px" borderWidth="0" borderRightWidth="1px" borderRadius="0" value={searchType} onChange={(event) => setSearchType(event.target.value)}><option value="user_name">직원</option><option value="work_place">근무지</option><option value="work_place_detail">세부</option></Select>
                      <InputGroup size="sm" w="165px"><InputLeftElement pointerEvents="none"><FiSearch color="#A0AEC0" /></InputLeftElement><Input borderWidth="0" value={keyword} onChange={(event) => setKeyword(event.target.value)} onKeyDown={(event) => event.key === "Enter" && handleSearch()} placeholder="검색" /></InputGroup>
                    </HStack>
                    <HStack spacing={0} borderWidth="1px" borderRadius="md" overflow="hidden">{[{ value: "ALL", label: "전체" }, { value: "DAY", label: "주간" }, { value: "NIGHT", label: "야간" }, { value: "OFF", label: "휴무" }, { value: "TRAINING", label: "교육" }].map((item) => <Button key={item.value} size="sm" borderRadius="0" px={2} colorScheme="blue" variant={statusFilter === item.value ? "solid" : "ghost"} onClick={() => setStatusFilter(item.value)}>{item.label}</Button>)}</HStack>
                    <Button size="sm" colorScheme="blue" onClick={handleSearch} isLoading={loading}>조회</Button>
                  </HStack>
                </HStack>
                <HStack justify="space-between" align="center" spacing={4}>
                  <HStack spacing={1.5} overflowX="auto" pb={1}>
                    <Text flex="0 0 auto" mr={1} fontSize="xs" color="gray.500">주차 선택</Text>
                    {monthWeeks.map((week, index) => {
                      const active = data.week_start === week.start;
                      const today = toLocalDateValue();
                      const current = today >= week.start && today <= week.end;
                      return <Button key={week.start} size="sm" h="42px" flex="0 0 auto" px={3} colorScheme={active ? "blue" : current ? "cyan" : "gray"} variant={active ? "solid" : "outline"} onClick={() => selectWeek(week.start)}>
                        <Box textAlign="left"><Text fontSize="11px" fontWeight="800">{index + 1}주차 {current && <Badge ml={1} colorScheme="cyan" fontSize="8px">이번 주</Badge>}</Text><Text fontSize="9px" opacity={0.8}>{week.start.slice(5).replace("-", ".")}—{week.end.slice(5).replace("-", ".")}</Text></Box>
                      </Button>;
                    })}
                  </HStack>
                  <HStack flex="0 0 auto" spacing={2}>
                    {[{ label: "주간", scheme: "green" }, { label: "야간", scheme: "blue" }, { label: "휴무", scheme: "gray" }, { label: "교육", scheme: "orange" }].map((item) => (
                      <HStack key={item.label} minW="76px" justify="center" spacing={1.5} px={3} py={2} borderRadius="md" bg={`${item.scheme}.50`} borderLeftWidth="4px" borderColor={`${item.scheme}.300`}>
                        <Box w="9px" h="9px" borderRadius="full" bg={`${item.scheme}.400`} />
                        <Text fontSize="11px" fontWeight="800" color={`${item.scheme}.700`}>{item.label}</Text>
                      </HStack>
                    ))}
                  </HStack>
                </HStack>
              </>
            )}
            {loading ? (
              <Spinner alignSelf="center" my={12} />
            ) : !visibleUsers.length ? (
              <Box py={14} textAlign="center" borderWidth="1px" borderStyle="dashed" borderRadius="lg" bg="gray.50">
                <Text fontWeight="800" color="gray.600">조회된 근무표가 없습니다.</Text>
                <Text mt={1} fontSize="sm" color="gray.500">검색 조건을 변경하거나 다른 날짜를 선택해주세요.</Text>
              </Box>
            ) : isMobile ? (
              <MobileCards dates={displayedDates} selectedDate={date} users={visibleUsers} />
            ) : (
              <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
                <DesktopTable dates={displayedDates} users={pagedUsers} />
                <Pagination currentPage={currentPage} totalPages={totalPages} totalCount={visibleUsers.length} onChange={setCurrentPage} />
              </Box>
            )}
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
