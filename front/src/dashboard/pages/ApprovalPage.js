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

// ✅ 상태값(한글) -> 서버로 보낼 status 값
const STATUS_MAP = {
  전체: "", // 전체면 status 파라미터 제거
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

// details 배열에서 특정 work_type minutes 찾기
const getMinutesByType = (details = [], type) => {
  const found = details.find((d) => d.work_type === type);
  return Number(found?.minutes) || 0;
};

// ISO/문자열 날짜에서 YYYY-MM-DD만
const toDateOnly = (value) => {
  if (!value) return "";
  if (typeof value === "string" && value.includes("T")) return value.split("T")[0];
  if (typeof value === "string" && value.includes(" ")) return value.split(" ")[0];
  return String(value);
};

// work_start/end에서 HH:MM만 (표시용)
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

// ✅ 서버가 status를 안 줄 때 대비: is_approved / reject_reason로 계산
const deriveStatus = (w) => {
  if (w?.is_approved === true) return "승인";
  const rr = (w?.reject_reason ?? "").trim();
  if (rr) return "거절";
  return "대기";
};

// 상태 태그
const StatusTag = ({ status }) => {
  const cs = status === "승인" ? "green" : status === "거절" ? "red" : "yellow";
  return (
    <Tag size="sm" colorScheme={cs}>
      {status}
    </Tag>
  );
};

// yyyy-mm-dd 포맷
const toYMD = (d) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export default function ApprovePage() {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [statusFilter, setStatusFilter] = useState("전체");
  const [selectedIds, setSelectedIds] = useState(new Set());

  // ✅ 거절 사유 입력
  const [rejectReason, setRejectReason] = useState("");

  const today = useMemo(() => new Date(), []);
  const [range, setRange] = useState({ from: today, to: today });

  const startDate = useMemo(() => (range?.from ? toYMD(range.from) : ""), [range]);
  const endDate = useMemo(() => {
    if (range?.to) return toYMD(range.to);
    if (range?.from) return toYMD(range.from);
    return "";
  }, [range]);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleCloseModal = () => {
    setRejectReason("");
    onClose();
  };

  const fetchList = async () => {
    try {
      setLoading(true);

      const params = {
        status: STATUS_MAP[statusFilter] ?? "",
        start_date: startDate,
        end_date: endDate,
      };

      // ✅ "전체"면 status 파라미터 제거
      if (!params.status) delete params.status;

      const qs = new URLSearchParams(params).toString();
      const url = qs ? `/api/admin_page_workday/?${qs}` : `/api/admin_page_workday/`;

      const res = await fetchWithAuth(url, { method: "GET" }, { toast });
      if (!res.ok) throw new Error("근무내역 조회 실패");

      const json = await res.json().catch(() => ({}));

      // ✅ 응답: { success: true, data: [...] } 기준 + fallback
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

        // ✅ 서버 status 우선, 없으면 계산
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

      // ✅ 날짜 최신순 정렬
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

  // ✅ 필터/날짜 바뀌면 자동 조회
  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, startDate, endDate]);

  const tableRows = useMemo(() => rows, [rows]);

  const handleRowClick = (emp) => {
    setSelectedEmployee(emp);
    // ✅ 모달 열 때 기존 사유 초기화
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
            onClick={fetchList}
            isLoading={loading}
            loadingText="조회 중"
          >
            조회
          </Button>

          <Text fontSize="sm" color="gray.600">
            선택: {selectedIds.size}건
          </Text>
        </HStack>

        <Box ml="auto">
          <Popover placement="bottom-end">
            <PopoverTrigger>
              <Button size="sm" variant="outline">
                📅 {startDate} ~ {endDate}
              </Button>
            </PopoverTrigger>

            <PopoverContent w="auto">
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverBody>
                <DayPicker
                  mode="range"
                  numberOfMonths={1}
                  defaultMonth={today}
                  selected={range}
                  onSelect={(r) => {
                    if (!r?.from) {
                      setRange({ from: today, to: today });
                      return;
                    }
                    setRange({ from: r.from, to: r.to ?? r.from });
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
        <Table mt={4} variant="striped">
          <Thead>
            <Tr>
              <Th w="60px">
                <Checkbox
                  isChecked={allChecked}
                  isIndeterminate={isIndeterminate}
                  onChange={(e) => toggleAll(e.target.checked)}
                />
              </Th>
              <Th>사번</Th>
              <Th>이름</Th>
              <Th>상태</Th>
              <Th>근무일</Th>
              <Th>주간(표시)</Th>
              <Th>업체/장소</Th>
            </Tr>
          </Thead>

          <Tbody>
            {tableRows.map((emp) => (
              <Tr
                key={emp.id}
                onClick={() => handleRowClick(emp)}
                cursor="pointer"
                _hover={{ opacity: 0.9 }}
                style={{
                  backgroundColor:
                    emp.status === "승인"
                      ? "#e6ffed"
                      : emp.status === "거절"
                      ? "#ffe6e6"
                      : "#fffbe6",
                }}
              >
                <Td onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    isChecked={selectedIds.has(emp.id)}
                    onChange={(e) => toggleOne(emp.id, e.target.checked)}
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
      )}

      {selectedEmployee && (
        <Modal isOpen={isOpen} onClose={handleCloseModal} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>근무 상세 정보</ModalHeader>
            <ModalBody>
              <Box border="1px solid #ddd" borderRadius="8px" p={4} mb={4} bg="#f9f9f9">
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

              {/* ✅ 거절 사유 입력 */}
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
                />
              </Box>
            </ModalBody>

            <ModalFooter>
              <Button
                colorScheme="green"
                mr={3}
                onClick={() => alert("승인 기능은 다음 단계에서 API 연결하면 됩니다.")}
              >
                승인
              </Button>

              <Button
                colorScheme="red"
                mr={3}
                onClick={() => {
                  if (!rejectReason.trim()) {
                    toast({
                      title: "거절 사유 필요",
                      description: "거절 사유를 입력해주세요.",
                      status: "warning",
                    });
                    return;
                  }

                  // 🔥 다음 단계에서 여기서 API 연결하면 됨
                  console.log("거절 처리(임시)", {
                    id: selectedEmployee.id,
                    reason: rejectReason,
                    raw: selectedEmployee.raw,
                  });

                  toast({
                    title: "거절 처리됨 (임시)",
                    description: `사유: ${rejectReason}`,
                    status: "success",
                  });

                  handleCloseModal();
                }}
              >
                거절
              </Button>

              <Button colorScheme="gray" onClick={handleCloseModal}>
                닫기
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
}
