// src/pages/ApprovePage.js
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Tag,
  Flex,
  useDisclosure,
  Spinner,
  Text,
  Select,
  Checkbox,
  HStack,
  useToast,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Textarea,
} from "@chakra-ui/react";

import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import { fetchWithAuth } from "../../api/fetchWithAuth";
import { adminWorkdayStatusUpdate } from "../js/ApprovalUpdateAPI";

// ✅ 상태값(한글) -> 서버로 보낼 status 값
const STATUS_MAP = {
  전체: "전체",
  승인: "승인",
  대기: "대기",
  거절: "거절",
};

// minutes -> "HH:MM"
const minutesToHM = (mins) => {
  const m = Math.max(0, Number(mins) || 0);
  const hh = String(Math.floor(m / 60)).padStart(2, "0");
  const mm = String(m % 60).padStart(2, "0");
  return `${hh}:${mm}`;
};

const getMinutesByType = (details = [], type) => {
  const found = details.find((d) => d.work_type === type);
  return Number(found?.minutes) || 0;
};

const toDateOnly = (value) => {
  if (!value) return "";
  if (typeof value === "string" && value.includes("T")) return value.split("T")[0];
  if (typeof value === "string" && value.includes(" ")) return value.split(" ")[0];
  return String(value);
};

const toTimeHM = (value) => {
  if (!value) return "";
  if (typeof value === "string" && value.includes("T")) {
    const timePart = value.split("T")[1] || "";
    return timePart.slice(0, 5);
  }
  if (typeof value === "string" && value.includes(" ")) {
    const timePart = value.split(" ")[1] || "";
    return timePart.slice(0, 5);
  }
  return "";
};

const deriveStatus = (w) => {
  if (w?.is_approved === true) return "승인";
  const rr = (w?.reject_reason ?? "").trim();
  if (rr) return "거절";
  return "대기";
};

const StatusTag = ({ status }) => {
  const cs = status === "승인" ? "green" : status === "거절" ? "red" : "yellow";
  return (
    <Tag size="sm" colorScheme={cs}>
      {status}
    </Tag>
  );
};

const toYMD = (d) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export default function ApprovePage() {
  const toast = useToast();

  // ✅ 최초 1회 자동 조회를 했는지
  const [didInitialFetch, setDidInitialFetch] = useState(false);

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // ✅ 화면 필터는 기본을 "대기"로
  const [statusFilter, setStatusFilter] = useState("대기");
  const [selectedIds, setSelectedIds] = useState(new Set());

  const [rejectReason, setRejectReason] = useState("");
  const [saving, setSaving] = useState(false);

  // ✅ 오늘 + 달력 표시 월(month) 제어
  const today = useMemo(() => new Date(), []);
  const [range, setRange] = useState({ from: today, to: today });
  const [calendarMonth, setCalendarMonth] = useState(today);

  const startDate = useMemo(() => (range?.from ? toYMD(range.from) : ""), [range]);
  const endDate = useMemo(() => {
    if (range?.to) return toYMD(range.to);
    if (range?.from) return toYMD(range.from);
    return "";
  }, [range]);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleCloseModal = () => {
    setRejectReason("");
    setSelectedEmployee(null);
    onClose();
  };

  /**
   * ✅ fetchList는 "버튼 조회"용이 기본
   * - overrideStatus가 있으면 그 값으로 강제 조회(최초 1회 자동 조회에 사용)
   * - 그 외는 현재 statusFilter/startDate/endDate 기준으로 조회
   */
  const fetchList = async ({ overrideStatus } = {}) => {
    try {
      setLoading(true);

      const statusToSend =
        typeof overrideStatus === "string" ? overrideStatus : statusFilter;

      const params = {
        status: STATUS_MAP[statusToSend] ?? "",
        start_date: startDate,
        end_date: endDate,
      };

      if (!params.status) delete params.status;

      const qs = new URLSearchParams(params).toString();
      const url = qs ? `/api/admin_page_workday/?${qs}` : `/api/admin_page_workday/`;

      const res = await fetchWithAuth(url, { method: "GET" }, { toast });
      if (!res.ok) throw new Error("근무내역 조회 실패");

      const json = await res.json().catch(() => ({}));

      const workDays = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json?.work_days)
        ? json.work_days
        : [];

      const mapped = workDays.map((w, idx) => {
        const dayMins =
          getMinutesByType(w.details, "DAY") || getMinutesByType(w.details, "주간");
        const overtimeMins =
          getMinutesByType(w.details, "OVERTIME") || getMinutesByType(w.details, "잔업");
        const lunchMins =
          getMinutesByType(w.details, "LUNCH") || getMinutesByType(w.details, "중식");
        const extraMins =
          getMinutesByType(w.details, "EXTRA") || getMinutesByType(w.details, "특근");

        const startHM = toTimeHM(w.work_start);
        const endHM = toTimeHM(w.work_end);

        const statusFromServer = w.status || w.approval_status || deriveStatus(w);

        const empNo = w.employee_number ?? "";
        const dateOnly = toDateOnly(w.work_date);

        return {
          id: w.id ?? `${empNo}-${dateOnly}-${idx}`,
          employeeNumber: empNo,
          name: w.user_name ?? "",
          date: dateOnly,
          location: w.work_place ?? "",
          workTime: startHM && endHM ? `${startHM}~${endHM}` : "",
          dayHM: minutesToHM(dayMins),

          overtimeMins,
          lunchMins,
          extraMins,

          overtimeDuration: minutesToHM(overtimeMins),
          lunchDuration: minutesToHM(lunchMins),
          specialWorkDuration: minutesToHM(extraMins),

          overtimeChecked: overtimeMins > 0,
          lunchChecked: lunchMins > 0,
          specialWorkChecked: extraMins > 0,

          status: statusFromServer,
          raw: w,
        };
      });

      mapped.sort((a, b) => (a.date < b.date ? 1 : -1));

      setRows(mapped);
      setSelectedIds(new Set());
    } catch (e) {
      console.error(e);
      setRows([]);
      toast({
        title: "조회 실패",
        description: e?.message || "근무내역을 불러오지 못했습니다.",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ 최초 1회만 "대기"로 자동 조회
  useEffect(() => {
    if (didInitialFetch) return;

    fetchList({ overrideStatus: "대기" }).finally(() => {
      setDidInitialFetch(true);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [didInitialFetch]);

  const tableRows = useMemo(() => rows, [rows]);

  const handleRowClick = (emp) => {
    setSelectedEmployee(emp);
    setRejectReason("");
    onOpen();
  };

  const allChecked = tableRows.length > 0 && tableRows.every((r) => selectedIds.has(r.id));
  const isIndeterminate = tableRows.some((r) => selectedIds.has(r.id)) && !allChecked;

  const toggleAll = (checked) => {
    const next = new Set(selectedIds);
    if (checked) tableRows.forEach((r) => next.add(r.id));
    else tableRows.forEach((r) => next.delete(r.id));
    setSelectedIds(next);
  };

  const toggleOne = (id, checked) => {
    const next = new Set(selectedIds);
    if (checked) next.add(id);
    else next.delete(id);
    setSelectedIds(next);
  };

  // ✅ 승인
  const handleApprove = async () => {
    if (!selectedEmployee) return;

    setSaving(true);
    try {
      const payload = {
        employee_number: selectedEmployee.employeeNumber,
        work_date: selectedEmployee.date,
        status: "Y",
      };

      await adminWorkdayStatusUpdate(payload, { toast });
      toast({ title: "승인 완료", status: "success" });

      await fetchList();
      handleCloseModal();
    } catch (e) {
      toast({
        title: "승인 실패",
        description: e?.message || "승인 처리 중 오류",
        status: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // ✅ 거절
  const handleReject = async () => {
    if (!selectedEmployee) return;

    if (!rejectReason.trim()) {
      toast({
        title: "거절 사유 필요",
        description: "거절 사유를 입력해주세요.",
        status: "warning",
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        employee_number: selectedEmployee.employeeNumber,
        work_date: selectedEmployee.date,
        status: "N",
        reject_reason: rejectReason.trim(),
      };

      await adminWorkdayStatusUpdate(payload, { toast });
      toast({ title: "거절 완료", status: "success" });

      await fetchList();
      handleCloseModal();
    } catch (e) {
      toast({
        title: "거절 실패",
        description: e?.message || "거절 처리 중 오류",
        status: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // ✅ 헤더 아래 라인 스타일(반복 줄이기)
  const headLine = { borderBottom: "1px solid", borderColor: "blackAlpha.600" };

  return (
    <Box p={6}>
      <Text fontWeight="bold" fontSize="20px">
        사원 승인 페이지 (근무내역)
      </Text>

      <Flex mt={4} gap={3} align="flex-start" wrap="wrap">
        <HStack spacing={3} align="center">
          <HStack>
            <Text fontSize="sm" color="gray.600">
              조회 방식
            </Text>
            <Select
              size="sm"
              w="180px"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              isDisabled={loading || saving}
            >
              <option value="전체">전체</option>
              <option value="승인">승인</option>
              <option value="대기">대기</option>
              <option value="거절">거절</option>
            </Select>
          </HStack>

          <Button
            size="sm"
            colorScheme="blue"
            onClick={() => fetchList()}
            isLoading={loading}
            loadingText="조회 중"
            isDisabled={saving}
          >
            조회
          </Button>

          <Text fontSize="sm" color="gray.600">
            선택: {selectedIds.size}건
          </Text>

          {!didInitialFetch && (
            <Tag size="sm" colorScheme="blue">
              초기 조회중...
            </Tag>
          )}
        </HStack>

        {/* ✅ 달력 Popover */}
        <Box ml="auto">
          <Popover placement="bottom-end">
            <PopoverTrigger>
              <Button size="sm" variant="outline" isDisabled={loading || saving}>
                📅 {startDate} ~ {endDate}
              </Button>
            </PopoverTrigger>

            <PopoverContent w="auto" p={0}>
              <PopoverArrow />

              {/* ✅ 상단바: Today + 닫기(X) 분리 */}
              <Flex
                align="center"
                justify="space-between"
                px={3}
                py={2}
                borderBottom="1px solid"
                borderColor="blackAlpha.200"
                bg="white"
              >
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => {
                    setRange({ from: today, to: today });
                    setCalendarMonth(today);
                  }}
                  isDisabled={saving || loading}
                >
                  Today
                </Button>

                <PopoverCloseButton position="static" />
              </Flex>

              <PopoverBody p={3}>
                <DayPicker
                  mode="range"
                  numberOfMonths={1}
                  month={calendarMonth}
                  onMonthChange={setCalendarMonth}
                  selected={range}
                  onSelect={(r) => {
                    if (!r?.from) {
                      setRange({ from: today, to: today });
                      setCalendarMonth(today);
                      return;
                    }
                    setRange({ from: r.from, to: r.to ?? r.from });
                    // ✅ 날짜 바꿔도 통신 X (버튼 조회만)
                  }}
                />
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </Box>
      </Flex>

      {loading ? (
        <Flex mt={6} align="center" gap={3}>
          <Spinner />
          <Text>불러오는 중...</Text>
        </Flex>
      ) : (
        <Box
          mt={4}
          borderWidth="1px"
          borderStyle="solid"
          borderColor="black"
          borderRadius="12px"
          overflow="hidden"
          bg="white"
        >
          <Table variant="simple"  sx={{ tableLayout: "fixed" }}>
            <Thead bg="gray.50">
              <Tr>
                <Th
                  w="40px"
                  minW="40px"
                  maxW="40px"
                  p="0"
                  textAlign="center"
                  {...headLine}
                >
                  <Checkbox
                    size="sm"
                    isChecked={allChecked}
                    isIndeterminate={isIndeterminate}
                    onChange={(e) => toggleAll(e.target.checked)}
                    isDisabled={saving}
                  />
                </Th>

                <Th {...headLine}>사번</Th>
                <Th {...headLine}>이름</Th>
                <Th {...headLine}>상태</Th>
                <Th {...headLine}>근무일</Th>
                <Th {...headLine}>근무 시간</Th>
                <Th {...headLine}>근무지</Th>
              </Tr>
            </Thead>

            <Tbody>
              {tableRows.map((emp) => (
                <Tr
                  key={emp.id}
                  onClick={() => handleRowClick(emp)}
                  cursor="pointer"
                  _hover={{ bg: "gray.50" }}
                >
                  <Td
                    w="40px"
                    minW="40px"
                    maxW="40px"
                    p="0"
                    textAlign="center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      size="sm"
                      isChecked={selectedIds.has(emp.id)}
                      onChange={(e) => toggleOne(emp.id, e.target.checked)}
                      isDisabled={saving}
                    />
                  </Td>

                  <Td>{emp.employeeNumber}</Td>
                  <Td>{emp.name}</Td>
                  <Td>
                    <StatusTag status={emp.status} />
                  </Td>
                  <Td>{emp.date}</Td>
                  <Td>{emp.dayHM}</Td>
                  <Td>{emp.location}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      {selectedEmployee && (
        <Modal isOpen={isOpen} onClose={handleCloseModal} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>근무 상세 정보</ModalHeader>
            <ModalBody>
              <Box border="1px solid #333" borderRadius="8px" p={4} mb={4} bg="#f9f9f9">
                <Flex mb={2}>
                  <Box flex="1">
                    <strong>사번:</strong> {selectedEmployee.employeeNumber}
                  </Box>
                  <Box flex="1">
                    <strong>이름:</strong> {selectedEmployee.name}
                  </Box>
                </Flex>

                <Flex mb={2}>
                  <Box flex="1">
                    <strong>상태:</strong> <StatusTag status={selectedEmployee.status} />
                  </Box>
                  <Box flex="1">
                    <strong>근무일:</strong> {selectedEmployee.date}
                  </Box>
                </Flex>

                <Flex mb={2}>
                  <Box flex="1">
                    <strong>작업시간:</strong> {selectedEmployee.workTime}
                  </Box>
                  <Box flex="1">
                    <strong>업체명/위치:</strong> {selectedEmployee.location}
                  </Box>
                </Flex>

                <Flex mb={2}>
                  <Box flex="1">
                    <strong>주간:</strong> {selectedEmployee.dayHM} (표시)
                  </Box>
                  <Box flex="1">
                    <strong>잔업:</strong>{" "}
                    {selectedEmployee.overtimeChecked
                      ? selectedEmployee.overtimeDuration
                      : "없음"}
                  </Box>
                </Flex>

                <Flex mb={2}>
                  <Box flex="1">
                    <strong>중식:</strong>{" "}
                    {selectedEmployee.lunchChecked ? selectedEmployee.lunchDuration : "없음"}
                  </Box>
                  <Box flex="1">
                    <strong>특근:</strong>{" "}
                    {selectedEmployee.specialWorkChecked
                      ? selectedEmployee.specialWorkDuration
                      : "없음"}
                  </Box>
                </Flex>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={1}>
                  거절 사유
                </Text>
                <Textarea
                  placeholder="거절 사유를 입력하세요"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  size="sm"
                  resize="none"
                  isDisabled={saving}
                />
              </Box>
            </ModalBody>

            <ModalFooter>
              <Button
                colorScheme="green"
                mr={3}
                onClick={handleApprove}
                isLoading={saving}
                loadingText="처리 중"
              >
                승인
              </Button>

              <Button
                colorScheme="red"
                mr={3}
                onClick={handleReject}
                isLoading={saving}
                loadingText="처리 중"
              >
                거절
              </Button>

              <Button colorScheme="gray" onClick={handleCloseModal} isDisabled={saving}>
                닫기
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
}
