import { useEffect, useMemo, useState } from "react";
import { Badge, Box, Button, HStack, Input, Select, SimpleGrid, Table, Tbody, Td, Text, Th, Thead, Tr, VStack } from "@chakra-ui/react";
import { FiEdit2, FiPlus, FiSave, FiTrash2, FiX } from "react-icons/fi";

import { getScheduleStatus, SCHEDULE_STATUSES } from "../constants/scheduleStatus";
import WorkSchedulePagination from "./WorkSchedulePagination";

const PAGE_SIZE = 8;
const draftId = () => `draft-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const scheduleKey = (item) => item.schedule_uuid || item.__client_uuid || item.__draft_id;
const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
const dayLabel = (date) => DAY_LABELS[new Date(`${date}T00:00:00`).getDay()];
const editDateLabel = (date, selectedDate) => {
  const relation = date === selectedDate ? " · 선택일" : "";
  return `${dayLabel(date)} ${date.slice(5).replace("-", ".")}${relation}`;
};

function ScheduleCard({ schedule, compact }) {
  const status = getScheduleStatus(schedule.status);
  return <Box minW={0} minH={compact ? "62px" : "70px"} p={compact ? 1.5 : 2} borderWidth="1px" borderLeftWidth="3px" borderColor={`${status.colorScheme}.300`} borderRadius="md" bg={`${status.colorScheme}.50`} title={[status.label, schedule.work_place, schedule.work_place_detail].filter(Boolean).join(" · ")}>
    <Badge colorScheme={status.colorScheme} fontSize={compact ? "9px" : "10px"}>{status.label}</Badge>
    {schedule.work_place && <Text mt={1} fontSize={compact ? "10px" : "xs"} fontWeight="800" noOfLines={1}>{schedule.work_place}</Text>}
    {schedule.work_place_detail && <Text fontSize="9px" color="gray.600" noOfLines={1}>{schedule.work_place_detail}</Text>}
  </Box>;
}

function ScheduleCell({ schedules }) {
  if (!schedules.length) return <Text py={3} textAlign="center" color="gray.300">+</Text>;
  const multiple = schedules.length > 1;
  return <Box position="relative">
    {multiple && <Badge position="absolute" zIndex={1} top="-7px" right="-5px" borderRadius="full" colorScheme="blue" fontSize="9px">{schedules.length}건</Badge>}
    <SimpleGrid columns={multiple ? 2 : 1} spacing={1}>{schedules.map((item, index) => <ScheduleCard key={scheduleKey(item) || index} schedule={item} compact={multiple} />)}</SimpleGrid>
  </Box>;
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

export default function AdminWeekScheduleTable({ data, selectedDate, workPlaces, onApplyRows }) {
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

  const startEditing = () => { setDraftRows(Object.fromEntries(visibleUsers.map((user) => [user.user_uuid, { [editDate]: (user.days?.[editDate] || []).map((item) => ({ ...item })) }] ))); setEditing(true); };
  const cancelEditing = () => { setDraftRows({}); setEditing(false); };
  const updateDay = (userUuid, updater) => setDraftRows((current) => ({ ...current, [userUuid]: { [editDate]: updater(current[userUuid][editDate]) } }));
  const applyEditing = () => { const rows = visibleUsers.map((user) => ({ user, draftDays: draftRows[user.user_uuid] })); if (onApplyRows(rows, [editDate]) !== false) cancelEditing(); };

  return <Box>
    <HStack mb={2} justify="space-between" align={{ base: "flex-start", md: "center" }} flexDirection={{ base: "column", md: "row" }}>
      <Box>
        <Text fontSize="sm" fontWeight="800">{dates[0]?.slice(5).replace("-", ".")} {dates[0] && dayLabel(dates[0])} — {dates[dates.length - 1]?.slice(5).replace("-", ".")} {dates[dates.length - 1] && dayLabel(dates[dates.length - 1])}</Text>
        <Text fontSize="xs" color="gray.500">선택한 날짜가 포함된 월요일~일요일</Text>
      </Box>
      <HStack fontSize="xs" color="gray.600"><Badge colorScheme="cyan">선택일</Badge><Badge colorScheme="blue">편집일</Badge></HStack>
    </HStack>
    <HStack mb={3} spacing={2} flexWrap="wrap">
      <Input maxW="260px" bg="white" placeholder="직원 이름 검색" value={nameFilter} onChange={(e) => setNameFilter(e.target.value)} isDisabled={editing} />
      <Select maxW="210px" bg="white" value={placeFilter} onChange={(e) => setPlaceFilter(e.target.value)} isDisabled={editing}><option value="">전체 근무지</option>{placeNames.map((name) => <option key={name} value={name}>{name}</option>)}</Select>
      <Select maxW="170px" bg="white" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} isDisabled={editing}><option value="">전체 상태</option>{SCHEDULE_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</Select>
      <Box flex="1" />
      {editing ? <><Text fontSize="sm" color="blue.600" fontWeight="700">{editDateLabel(editDate, selectedDate)} · {visibleUsers.length}명 편집 중</Text><Button leftIcon={<FiX />} variant="outline" onClick={cancelEditing}>편집 취소</Button><Button leftIcon={<FiSave />} colorScheme="blue" onClick={applyEditing}>변경 적용</Button></> : <HStack spacing={0} borderWidth="2px" borderColor="blue.400" borderRadius="md" overflow="hidden" bg="white"><Text px={3} fontSize="xs" fontWeight="800" color="blue.700" whiteSpace="nowrap">편집할 날짜</Text><Select w="190px" borderWidth="0" borderLeftWidth="1px" borderRadius="0" value={editDate} onChange={(e) => setEditDate(e.target.value)}>{dates.map((date) => <option key={date} value={date}>{editDateLabel(date, selectedDate)}</option>)}</Select><Button h="40px" borderRadius="0" leftIcon={<FiEdit2 />} colorScheme="blue" onClick={startEditing} isDisabled={!visibleUsers.length || !editDate}>이 날짜 편집</Button></HStack>}
    </HStack>
    <Box bg="white" borderWidth="1px" borderRadius="xl" overflow="hidden">
      <Box overflowX="auto">
      <Table size="sm" minW="1320px"><Thead bg="gray.50"><Tr><Th minW="150px" position="sticky" left={0} zIndex={3} bg="gray.50" boxShadow="2px 0 0 #E2E8F0">직원</Th>{dates.map((date) => { const day = new Date(`${date}T00:00:00`).getDay(); const baseline = date === selectedDate; const active = editing && date === editDate; return <Th key={date} minW={active ? "250px" : "165px"} textAlign="center" bg={active ? "blue.200" : baseline ? "cyan.50" : undefined} borderLeftWidth={active ? "3px" : baseline ? "2px" : undefined} borderRightWidth={active ? "3px" : baseline ? "2px" : undefined} borderTopWidth={baseline ? "3px" : undefined} borderColor={active ? "blue.500" : baseline ? "cyan.400" : undefined} color={active ? "blue.900" : baseline ? "cyan.800" : day === 0 ? "red.500" : day === 6 ? "blue.500" : "gray.700"}><Text fontSize="10px" mb={1}>{dayLabel(date)}</Text>{baseline && <Badge mr={2} colorScheme="cyan">선택</Badge>}{active && <Badge mr={2} colorScheme="blue">편집</Badge>}{date.slice(5).replace("-", ".")}</Th>; })}</Tr></Thead>
        <Tbody>{visibleUsers.map((user) => <Tr key={user.user_uuid} _hover={{ bg: "gray.50" }}><Td verticalAlign="top" py={4} position="sticky" left={0} zIndex={2} bg="white" boxShadow="2px 0 0 #E2E8F0"><Text fontWeight="900">{user.user_name}</Text></Td>{dates.map((date) => { const baseline = date === selectedDate; const active = editing && date === editDate; const schedules = active ? draftRows[user.user_uuid]?.[date] || [] : user.days?.[date] || []; const limitReached = schedules.length >= 2; return <Td key={date} p={2} verticalAlign="top" minW={active ? "250px" : undefined} bg={active ? "blue.50" : baseline ? "cyan.50" : undefined} borderLeftWidth={active ? "3px" : baseline ? "2px" : undefined} borderRightWidth={active ? "3px" : baseline ? "2px" : undefined} borderColor={active ? "blue.500" : baseline ? "cyan.300" : undefined}>{active ? <VStack align="stretch" spacing={1.5}><SimpleGrid columns={schedules.length > 1 ? 2 : 1} spacing={1.5}>{schedules.map((item) => <ScheduleEditor compact={schedules.length > 1} key={scheduleKey(item)} schedule={item} workPlaces={workPlaces} onChange={(next) => updateDay(user.user_uuid, (items) => items.map((current) => scheduleKey(current) === scheduleKey(item) ? next : current))} onRemove={() => updateDay(user.user_uuid, (items) => items.filter((current) => scheduleKey(current) !== scheduleKey(item)))} />)}</SimpleGrid><Button size="xs" variant="outline" colorScheme="blue" leftIcon={<FiPlus />} isDisabled={limitReached} title={limitReached ? "하루에 최대 2개 일정만 등록할 수 있습니다." : ""} onClick={() => updateDay(user.user_uuid, (items) => items.length >= 2 ? items : [...items, { __draft_id: draftId(), status: "DAY", status_label: "주간", admin_work_place_uuid: "", work_place: "", work_place_detail: "" }])}>{limitReached ? "최대 2개" : "일정 추가"}</Button></VStack> : <ScheduleCell schedules={schedules} />}</Td>; })}</Tr>)}</Tbody>
      </Table>
      </Box>
      {!filteredUsers.length && <Text py={14} textAlign="center" color="gray.500">조건에 맞는 직원이 없습니다.</Text>}
      <WorkSchedulePagination currentPage={currentPage} totalPages={totalPages} totalCount={filteredUsers.length} pageSize={PAGE_SIZE} onChange={(page) => { if (!editing) setCurrentPage(page); }} />
    </Box>
  </Box>;
}

