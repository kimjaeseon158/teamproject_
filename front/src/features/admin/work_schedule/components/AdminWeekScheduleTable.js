import { useEffect, useMemo, useRef, useState } from "react";
import { Badge, Box, Button, HStack, Input, Select, SimpleGrid, Table, Tbody, Td, Text, Th, Thead, Tr, VStack } from "@chakra-ui/react";
import { FiChevronLeft, FiChevronRight, FiEdit2, FiPlus, FiSave, FiTrash2, FiX } from "react-icons/fi";

import { getScheduleStatus, SCHEDULE_STATUSES } from "../constants/scheduleStatus";
import { addDaysToDateValue } from "../../../common/utils/dateValue";
import WorkSchedulePagination from "./WorkSchedulePagination";

const PAGE_SIZE = 8;
const draftId = () => `draft-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const scheduleKey = (item) => item.schedule_uuid || item.__client_uuid || item.__draft_id;
const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
const dayLabel = (date) => DAY_LABELS[new Date(`${date}T00:00:00`).getDay()];


function ScheduleCell({ schedules }) {
  if (!schedules.length) return <Text textAlign="center" color="gray.400">–</Text>;
  return <SimpleGrid columns={schedules.length > 1 ? 2 : 1} spacing={1.5}>
    {schedules.map((schedule, index) => {
      const status = getScheduleStatus(schedule.status);
      return <Box key={scheduleKey(schedule) || index} minW={0} minH="54px" p={1.5} borderWidth="1px" borderLeftWidth="3px" borderColor={`${status.colorScheme}.300`} borderRadius="md" bg={`${status.colorScheme}.50`} title={[status.label, schedule.work_place, schedule.work_place_detail].filter(Boolean).join(" · ")}>
        <Badge colorScheme={status.colorScheme} fontSize="10px">{status.label}</Badge>
        {schedule.work_place && <Text mt={0.5} fontSize="xs" fontWeight="700" noOfLines={1}>{schedule.work_place}</Text>}
        {schedule.work_place_detail && <Text fontSize="10px" color="gray.600" noOfLines={1}>{schedule.work_place_detail}</Text>}
      </Box>;
    })}
  </SimpleGrid>;
}

function ScheduleEditor({ schedule, workPlaces, onChange, onRemove, compact = false }) {
  const status = getScheduleStatus(schedule.status);
  const changeStatus = (nextStatus) => {
    const next = getScheduleStatus(nextStatus);
    onChange({ ...schedule, status: nextStatus, status_label: next.label, ...(!next.requiresPlace && { admin_work_place_uuid: null, work_place: "" }) });
  };
  return <VStack minW={0} align="stretch" spacing={1} p={compact ? 1 : 1.5} borderWidth="2px" borderColor="blue.300" borderRadius="md" bg="white">
    <HStack spacing={1}><Select size="xs" value={schedule.status} onChange={(e) => changeStatus(e.target.value)}>{SCHEDULE_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</Select><Button aria-label="일정 삭제" size="xs" variant="ghost" colorScheme="red" minW="24px" px={1} onClick={onRemove}><FiTrash2 /></Button></HStack>
    <Select size="xs" value={status.requiresPlace ? schedule.admin_work_place_uuid || "" : ""} isDisabled={!status.requiresPlace} placeholder={status.requiresPlace ? "근무지 선택" : "근무지 없음"} onChange={(e) => { const place = workPlaces.find((item) => item.admin_work_place_uuid === e.target.value); onChange({ ...schedule, admin_work_place_uuid: e.target.value, work_place: place?.work_place || "" }); }}>{workPlaces.map((place) => <option key={place.admin_work_place_uuid} value={place.admin_work_place_uuid}>{place.work_place}</option>)}</Select>
    <Input size="xs" value={schedule.work_place_detail || ""} placeholder="세부내용 (선택)" onChange={(e) => onChange({ ...schedule, work_place_detail: e.target.value })} />
  </VStack>;
}

export default function AdminWeekScheduleTable({ data, selectedDate, workPlaces, onApplyRows, onDateChange, onEditingChange, dateChangeDisabled = false, isBusy = false }) {
  const scrollContainer = useRef(null);
  const selectedColumn = useRef(null);
  const [editing, setEditing] = useState(false);
  const [editDate, setEditDate] = useState(selectedDate);
  const [draftRows, setDraftRows] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [nameFilter, setNameFilter] = useState("");
  const [placeFilter, setPlaceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const dates = useMemo(() => (data.dates || []).filter((date) => date >= data.week_start && date <= data.week_end), [data.dates, data.week_end, data.week_start]);
  const placeNames = useMemo(() => [...new Set(workPlaces.map((place) => place.work_place).filter(Boolean))].sort(), [workPlaces]);
  const filteredUsers = useMemo(() => data.users.filter((user) => { const schedules = dates.flatMap((date) => user.days?.[date] || []); return (!nameFilter.trim() || user.user_name?.toLowerCase().includes(nameFilter.trim().toLowerCase())) && (!placeFilter || schedules.some((item) => item.work_place === placeFilter)) && (!statusFilter || schedules.some((item) => item.status === statusFilter)); }), [data.users, dates, nameFilter, placeFilter, statusFilter]);
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const visibleUsers = useMemo(() => filteredUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE), [currentPage, filteredUsers]);

  useEffect(() => { setCurrentPage(1); setEditing(false); setDraftRows({}); setEditDate(dates.includes(selectedDate) ? selectedDate : dates[0] || ""); }, [data.week_start, dates, selectedDate]);
  useEffect(() => setCurrentPage(1), [nameFilter, placeFilter, statusFilter]);
  useEffect(() => setCurrentPage((page) => Math.min(page, totalPages)), [totalPages]);

  useEffect(() => { onEditingChange?.(editing); }, [editing, onEditingChange]);
  useEffect(() => {
    const container = scrollContainer.current;
    const column = selectedColumn.current;
    if (!container || !column) return;
    const stickyWidth = container.querySelector("th")?.getBoundingClientRect().width || 150;
    const left = container.scrollLeft + column.getBoundingClientRect().left - container.getBoundingClientRect().left - stickyWidth - 8;
    container.scrollTo({ left: Math.max(0, left), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [selectedDate, dates, editing]);

  const startEditing = () => { setDraftRows(Object.fromEntries(visibleUsers.map((user) => [user.user_uuid, { [editDate]: (user.days?.[editDate] || []).map((item) => ({ ...item })) }] ))); setEditing(true); };
  const cancelEditing = () => { setDraftRows({}); setEditing(false); };
  const updateDay = (userUuid, updater) => setDraftRows((current) => ({ ...current, [userUuid]: { [editDate]: updater(current[userUuid][editDate]) } }));
  const applyEditing = () => { const rows = visibleUsers.map((user) => ({ user, draftDays: draftRows[user.user_uuid] })); if (onApplyRows(rows, [editDate]) !== false) cancelEditing(); };

  return <Box>
    <HStack mb={2} p={2} bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="xl" justify="space-between" align="center" flexWrap="wrap" spacing={3}>
      <HStack spacing={2} flexWrap="wrap" flex="1" minW={0}>
      <Input aria-label="직원 이름 검색" size="sm" w={{ base: "100%", md: "180px" }} bg="white" placeholder="직원 이름 검색" value={nameFilter} onChange={(e) => setNameFilter(e.target.value)} isDisabled={editing} />
      <Select aria-label="근무지 필터" size="sm" w="150px" bg="white" value={placeFilter} onChange={(e) => setPlaceFilter(e.target.value)} isDisabled={editing}><option value="">전체 근무지</option>{placeNames.map((name) => <option key={name} value={name}>{name}</option>)}</Select>
      <Select aria-label="근무 상태 필터" size="sm" w="120px" bg="white" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} isDisabled={editing}><option value="">전체 상태</option>{SCHEDULE_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</Select>

    </HStack>
      <HStack spacing={2} flexWrap="wrap">
        <Text fontSize="sm" fontWeight="800" color="gray.700">작업 날짜</Text>
        <HStack spacing={0} borderWidth="1px" borderColor="gray.200" borderRadius="md" overflow="hidden">
          <Button size="sm" variant="ghost" borderRadius={0} aria-label="이전 날짜" isDisabled={dateChangeDisabled} onClick={() => onDateChange(addDaysToDateValue(selectedDate, -1))}><FiChevronLeft /></Button>
          <Input aria-label="작업 날짜" type="date" size="sm" w="155px" minW={0} borderWidth={0} borderRadius={0} value={selectedDate} isDisabled={dateChangeDisabled} onChange={(event) => onDateChange(event.target.value)} />
          <Button size="sm" variant="ghost" borderRadius={0} aria-label="다음 날짜" isDisabled={dateChangeDisabled} onClick={() => onDateChange(addDaysToDateValue(selectedDate, 1))}><FiChevronRight /></Button>
        </HStack>
        {editing ? <>
          <Badge colorScheme="blue">{visibleUsers.length}명 편집 중</Badge>
          <Button size="sm" leftIcon={<FiX />} variant="outline" onClick={cancelEditing}>편집 취소</Button>
          <Button size="sm" leftIcon={<FiSave />} colorScheme="blue" onClick={applyEditing}>변경 적용</Button>
        </> : <Button size="sm" leftIcon={<FiEdit2 />} colorScheme="blue" onClick={startEditing} isDisabled={isBusy || !visibleUsers.length || !dates.includes(selectedDate) || !editDate}>이 날짜 편집</Button>}
      </HStack>
    </HStack>
    <Box bg="white" borderWidth="1px" borderRadius="xl" overflow="hidden">
      <Box ref={scrollContainer} overflowX="auto">
      <Table size="sm" minW={editing ? "1160px" : "880px"} sx={{ tableLayout: "fixed" }}><Thead bg="gray.50"><Tr><Th w="120px" px={3} py={2} position="sticky" left={0} zIndex={3} bg="gray.50" boxShadow="2px 0 0 #E2E8F0">직원</Th>{dates.map((date) => { const day = new Date(`${date}T00:00:00`).getDay(); const baseline = date === selectedDate; const active = editing && date === editDate; return <Th key={date} ref={baseline ? selectedColumn : null} w={active ? "280px" : undefined} px={1} py={1.5} textAlign="center" bg={active ? "blue.200" : baseline ? "cyan.50" : undefined} borderLeftWidth={active ? "3px" : baseline ? "2px" : undefined} borderRightWidth={active ? "3px" : baseline ? "2px" : undefined} borderTopWidth={baseline ? "3px" : undefined} borderColor={active ? "blue.500" : baseline ? "cyan.400" : undefined} color={active ? "blue.900" : baseline ? "cyan.800" : day === 0 ? "red.500" : day === 6 ? "blue.500" : "gray.700"}><Text fontSize="10px" mb={1}>{dayLabel(date)}</Text>{baseline && <Badge mr={2} colorScheme="cyan">선택</Badge>}{active && <Badge mr={2} colorScheme="blue">편집</Badge>}{date.slice(5).replace("-", ".")}</Th>; })}</Tr></Thead>
        <Tbody>{visibleUsers.map((user) => <Tr key={user.user_uuid} _hover={{ bg: "gray.50" }}><Td verticalAlign="middle" h="max(68px, calc((100dvh - 350px) / 8))" px={3} py={3} position="sticky" left={0} zIndex={2} bg="white" boxShadow="2px 0 0 #E2E8F0"><Text fontWeight="900">{user.user_name}</Text></Td>{dates.map((date) => { const baseline = date === selectedDate; const active = editing && date === editDate; const schedules = active ? draftRows[user.user_uuid]?.[date] || [] : user.days?.[date] || []; const limitReached = schedules.length >= 2; return <Td key={date} px={2} py={2} verticalAlign={active ? "top" : "middle"} bg={active ? "blue.50" : baseline ? "cyan.50" : undefined} borderLeftWidth={active ? "3px" : baseline ? "2px" : undefined} borderRightWidth={active ? "3px" : baseline ? "2px" : undefined} borderColor={active ? "blue.500" : baseline ? "cyan.300" : undefined}>{active ? <VStack align="stretch" spacing={1.5}><SimpleGrid columns={schedules.length > 1 ? 2 : 1} spacing={1.5}>{schedules.map((item) => <ScheduleEditor compact={schedules.length > 1} key={scheduleKey(item)} schedule={item} workPlaces={workPlaces} onChange={(next) => updateDay(user.user_uuid, (items) => items.map((current) => scheduleKey(current) === scheduleKey(item) ? next : current))} onRemove={() => updateDay(user.user_uuid, (items) => items.filter((current) => scheduleKey(current) !== scheduleKey(item)))} />)}</SimpleGrid><Button size="xs" variant="outline" colorScheme="blue" leftIcon={<FiPlus />} isDisabled={limitReached} title={limitReached ? "하루에 최대 2개 일정만 등록할 수 있습니다." : ""} onClick={() => updateDay(user.user_uuid, (items) => items.length >= 2 ? items : [...items, { __draft_id: draftId(), status: "DAY", status_label: "주간", admin_work_place_uuid: "", work_place: "", work_place_detail: "" }])}>{limitReached ? "최대 2개" : "일정 추가"}</Button></VStack> : <ScheduleCell schedules={schedules} />}</Td>; })}</Tr>)}</Tbody>
      </Table>
      </Box>
      {!filteredUsers.length && <Text py={14} textAlign="center" color="gray.500">조건에 맞는 직원이 없습니다.</Text>}
      <WorkSchedulePagination currentPage={currentPage} totalPages={totalPages} totalCount={filteredUsers.length} pageSize={PAGE_SIZE} onChange={(page) => { if (!editing) setCurrentPage(page); }} />
    </Box>
  </Box>;
}

