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

function ScheduleItems({ items, compact = false, dark = false }) {
  if (!items.length) return <Text fontSize="xs" color="gray.400">-</Text>;
  return (
    <VStack align="stretch" spacing={compact ? 1 : 2}>
      {items.map((item, index) => (
        <Box
          key={`${item.status}-${item.work_place}-${item.work_place_detail}-${index}`}
          px={compact ? 1.5 : 2}
          py={compact ? 1 : 2}
          borderRadius="md"
          bg={dark
            ? ({ DAY: "#4a3a18", NIGHT: "#12345a", OFF: "#29313b", TRAINING: "#173f31" }[item.status] || "#29313b")
            : compact ? "transparent" : `${statusColor[item.status] || "gray"}.50`}
          color={dark ? "white" : undefined}
          minH={dark ? "62px" : undefined}
          display={dark ? "flex" : undefined}
          flexDirection={dark ? "column" : undefined}
          justifyContent={dark ? "center" : undefined}
          textAlign={dark ? "center" : undefined}
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
              {item.work_place_detail && <Text mt={0.5} fontSize="9px" color="gray.500" noOfLines={1}>{item.work_place_detail}</Text>}
            </>
          ) : (
            <>
              <Badge colorScheme={statusColor[item.status] || "gray"}>{item.status_label}</Badge>
              {item.work_place && <Text mt={1} fontSize="xs" fontWeight="700">{item.work_place}</Text>}
              {item.work_place_detail && <Text fontSize="10px" color="gray.600">{item.work_place_detail}</Text>}
            </>
          )}
        </Box>
      ))}
    </VStack>
  );
}

const getDayMeta = (target, selected) => {
  const day = new Date(`${target}T00:00:00`).getDay();
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][day];
  const prefix = target === selected
    ? "오늘 · "
    : target === addDaysToDateValue(selected, 1)
      ? "내일 · "
      : "";
  return {
    label: `${prefix}${weekday} ${target.slice(5).replace("-", "/")}`,
    bg: day === 0 ? "red.50" : day === 6 ? "blue.50" : target === selected ? "blue.50" : "gray.50",
    color: day === 0 ? "red.600" : day === 6 ? "blue.600" : target === selected ? "blue.700" : "gray.700",
  };
};

function DesktopTable({ dates, selectedDate, users }) {
  return (
    <Box overflowX="auto" borderWidth="1px" borderRadius="lg">
      <Table size="sm" minW="1380px" sx={{ tableLayout: "fixed" }}>
        <Thead bg="gray.100">
          <Tr>
            <Th w="140px">직원</Th>
            <Th w="170px">근무지</Th>
            <Th w="180px">세부 근무지</Th>
            {dates.map((date) => {
              const meta = getDayMeta(date, selectedDate);
              return <Th key={date} textAlign="center" color={meta.color} bg={date === selectedDate ? "blue.50" : meta.bg}>{meta.label}</Th>;
            })}
          </Tr>
        </Thead>
        <Tbody>
          {users.map((user, userIndex) => {
            const schedules = dates.flatMap((target) => user.days?.[target] || []);
            const places = Array.from(new Set(schedules.map((item) => item.work_place).filter(Boolean)));
            const details = Array.from(new Set(schedules.map((item) => item.work_place_detail).filter(Boolean)));
            return (
              <Tr key={`${user.user_name}-${userIndex}`} _hover={{ bg: "gray.50" }}>
                <Td fontWeight="900">{user.user_name}</Td>
                <Td fontSize="sm" color="gray.700" noOfLines={2}>{places.join(" / ") || "-"}</Td>
                <Td fontSize="sm" color="gray.600" noOfLines={2}>{details.join(" / ") || "-"}</Td>
                {dates.map((date) => {
                  const meta = getDayMeta(date, selectedDate);
                  const day = new Date(`${date}T00:00:00`).getDay();
                  return (
                    <Td key={date} p={1.5} h="70px" verticalAlign="middle" bg={date === selectedDate || [0, 6].includes(day) ? meta.bg : "white"}>
                      <ScheduleItems items={user.days?.[date] || []} />
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
  const [workPlaceOptions, setWorkPlaceOptions] = useState([]);
  const [selectedWorkPlace, setSelectedWorkPlace] = useState("");
  const [loading, setLoading] = useState(false);

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
      const targetDates = Array.from({ length: 7 }, (_, index) =>
        addDaysToDateValue(targetDate, index - 5)
      );
      let missingDates = targetDates.filter((item) => !(response?.dates || []).includes(item));
      const adjacentResponses = [];
      let adjacentRequestCount = 0;
      while (missingDates.length && adjacentRequestCount < 2) {
        const beforeCount = missingDates.length;
        const adjacentResponse = await fetchUserWorkSchedule({ date: missingDates[0] }, { toast });
        adjacentResponses.push(adjacentResponse);
        const receivedDates = new Set(adjacentResponse?.dates || []);
        missingDates = missingDates.filter((item) => !receivedDates.has(item));
        adjacentRequestCount += 1;
        if (missingDates.length === beforeCount) break;
      }
      const occurrenceKeys = (users = []) => {
        const counts = new Map();
        return users.map((user) => {
          const count = counts.get(user.user_name) || 0;
          counts.set(user.user_name, count + 1);
          return [`${user.user_name}::${count}`, user];
        });
      };
      const extraSources = adjacentResponses.map((item) => ({
        dates: new Set(item?.dates || []),
        users: new Map(occurrenceKeys(item?.users)),
      }));
      const users = occurrenceKeys(response?.users).map(([key, user]) => ({
        ...user,
        days: targetDates.reduce((days, target) => {
          if (days[target] !== undefined) return days;
          const source = extraSources.find((item) => item.dates.has(target));
          return { ...days, [target]: source?.users.get(key)?.days?.[target] || [] };
        }, { ...user.days }),
      }));
      setData({ ...(response || { dates: [] }), users });
      if (!filterKeyword.trim()) {
        setWorkPlaceOptions(Array.from(new Set(
          users.flatMap((user) => targetDates.flatMap((target) =>
            (user.days?.[target] || []).map((item) => item.work_place).filter(Boolean)
          ))
        )));
      }
      setAppliedKeyword(filterKeyword.trim());
    } catch (error) {
      toast({ title: "근무표 조회에 실패했습니다.", description: error.message, status: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const nextDate = selectedDate?.formatted || toLocalDateValue();
    setDate(nextDate);
    setKeyword("");
    setAppliedKeyword("");
    setSelectedWorkPlace("");
    if (isOpen) load(nextDate);
  }, [isOpen, load, selectedDate?.formatted]);

  const displayedDates = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDaysToDateValue(date, index - 5)),
    [date]
  );
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

  const handleSearch = () => {
    if (searchType !== "work_place") setSelectedWorkPlace("");
    load(date, searchType, keyword);
  };
  const handleWorkPlaceFilter = (workPlace) => {
    setSelectedWorkPlace(workPlace);
    setSearchType("work_place");
    setKeyword(workPlace);
    load(date, workPlace ? "work_place" : "", workPlace);
  };
  const moveDate = (amount) => {
    const nextDate = addDaysToDateValue(date, amount);
    setDate(nextDate);
    load(nextDate, searchType, keyword);
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
                <Button aria-label="이전 날짜" variant="outline" onClick={() => moveDate(-1)}><FiChevronLeft /></Button>
                <Text minW={{ base: "160px", md: "260px" }} textAlign="center" fontSize={{ base: "lg", md: "2xl" }} fontWeight="900">{rangeLabel}</Text>
                <Button aria-label="다음 날짜" variant="outline" onClick={() => moveDate(1)}><FiChevronRight /></Button>
                <Button variant="outline" onClick={() => { const today = toLocalDateValue(); setDate(today); load(today, searchType, keyword); }}>오늘</Button>
                <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} maxW="160px" bg="white" />
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
                <HStack justify="space-between" align="flex-start">
                  <Box>
                    <HStack>
                      <Text fontSize="lg" fontWeight="900">읽기 전용 근무표</Text>
                      <Badge colorScheme="blue" borderRadius="full">DB 데이터</Badge>
                    </HStack>
                    <Text mt={1} fontSize="sm" color="gray.500">저장된 예정 근무표를 직원·근무지별로 확인합니다.</Text>
                  </Box>
                  <HStack>
                    <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} maxW="170px" />
                    <Button leftIcon={<RepeatIcon />} colorScheme="blue" onClick={() => load(date)} isLoading={loading}>조회</Button>
                  </HStack>
                </HStack>
                <HStack spacing={2} overflowX="auto" pb={1}>
                  <Button
                    size="sm"
                    flex="0 0 auto"
                    borderRadius="full"
                    colorScheme="blue"
                    variant={!selectedWorkPlace ? "solid" : "outline"}
                    onClick={() => handleWorkPlaceFilter("")}
                  >전체</Button>
                  {workPlaceOptions.map((workPlace) => (
                    <Button
                      key={workPlace}
                      size="sm"
                      flex="0 0 auto"
                      borderRadius="full"
                      colorScheme="blue"
                      variant={selectedWorkPlace === workPlace ? "solid" : "outline"}
                      onClick={() => handleWorkPlaceFilter(workPlace)}
                    >{workPlace}</Button>
                  ))}
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="md" fontWeight="900">전체 근무표</Text>
                  <Text fontSize="sm" color="gray.500">{visibleUsers.length}명</Text>
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
              <DesktopTable dates={displayedDates} selectedDate={date} users={visibleUsers} />
            )}
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
