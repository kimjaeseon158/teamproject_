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

/* =========================
   기존 유틸 그대로
========================= */

const STATUS_MAP = {
  전체: "전체",
  승인: "승인",
  대기: "대기",
  거절: "거절",
};

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
  if (w?.is_approved === false) return "거절";
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

const InfoCard = ({ title, children }) => (
  <Box
    border="1px solid"
    borderColor="gray.300"
    borderRadius="12px"
    p={4}
    mb={3}
    bg="gray.50"
  >
    <Text fontSize="sm" fontWeight="bold" mb={2} color="gray.700">
      {title}
    </Text>
    {children}
  </Box>
);
/* =========================
   메인
========================= */

export default function ApprovePage() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [didInitialFetch, setDidInitialFetch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [statusFilter, setStatusFilter] = useState("대기");
  const [selectedIds, setSelectedIds] = useState(new Set());

  const [rejectReason, setRejectReason] = useState("");
  const [saving, setSaving] = useState(false);

  const today = useMemo(() => new Date(), []);
  const [range, setRange] = useState({ from: today, to: today });      // 확정값
  const {
    isOpen: isCalendarOpen,
    onOpen: openCalendar,
    onClose: closeCalendar,
  } = useDisclosure();
  const startDate = useMemo(() => (range?.from ? toYMD(range.from) : ""), [range]);
  const endDate = useMemo(() => {
    if (range?.to) return toYMD(range.to);
    if (range?.from) return toYMD(range.from);
    return "";
  }, [range]);

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
      const url = qs
        ? `/api/admin_page_workday/?${qs}`
        : `/api/admin_page_workday/`;

      const res = await fetchWithAuth(url, { method: "GET" }, { toast });
      if (!res.ok) throw new Error("근무내역 조회 실패");

      const json = await res.json().catch(() => ({}));

      const workDays = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json?.work_days)
        ? json.work_days
        : [];

      const mapped = workDays.map((w, idx) => {
        const dayMins = getMinutesByType(w.details, "주간");
        const overtimeMins = getMinutesByType(w.details, "잔업");
        const lunchMins = getMinutesByType(w.details, "중식");
        const extraMins = getMinutesByType(w.details, "특근");

        // ✅ 변경: 근무구분 (details 기반)
        const workType =
          Array.isArray(w.details) && w.details.length > 0
            ? w.details[0].work_type
            : "-";

        return {
          id: w.id ?? `${w.user_uuid}-${w.work_date}-${idx}`,

          // ❌ 사원번호 제거
          user_uuid: w.user_uuid,

          name: w.user_name ?? "",
          date: toDateOnly(w.work_date),
          location: w.work_place ?? "",
          workTime:
            toTimeHM(w.work_start) && toTimeHM(w.work_end)
              ? `${toTimeHM(w.work_start)}~${toTimeHM(w.work_end)}`
              : "",

          // ✅ 테이블 표시용
          workType,

          // 🔥 이하 상세 모달용 그대로
          dayHM: minutesToHM(dayMins),
          overtimeDuration: minutesToHM(overtimeMins),
          lunchDuration: minutesToHM(lunchMins),
          specialWorkDuration: minutesToHM(extraMins),

          overtimeChecked: overtimeMins > 0,
          lunchChecked: lunchMins > 0,
          specialWorkChecked: extraMins > 0,

          status: w.status || deriveStatus(w),
          raw: w,
        };
      });

      setRows(mapped);
      setSelectedIds(new Set());
    } catch (e) {
      toast({
        title: "조회 실패",
        description: e?.message || "근무내역을 불러오지 못했습니다.",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const tableRows = useMemo(() => rows, [rows]);

  const handleRowClick = (emp) => {
    setSelectedEmployee(emp);
    setRejectReason("");
    onOpen();
  };
  const startOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay(); // 0=일, 1=월
    const diff = day === 0 ? -6 : 1 - day; // 월요일 기준
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const endOfWeek = (date) => {
    const start = startOfWeek(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  };
  const formatYMD = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;


  const rangeLabel = useMemo(() => {
    if (!range?.from) return "-";

    const from = formatYMD(range.from);
    const to = formatYMD(range.to ?? range.from);

    return `${from} ~ ${to}`;
  }, [range]);

  const allChecked =
    tableRows.length > 0 && tableRows.every((r) => selectedIds.has(r.id));
  const isIndeterminate =
    tableRows.some((r) => selectedIds.has(r.id)) && !allChecked;

  const toggleAll = (checked) => {
    const next = new Set(selectedIds);
    if (checked) tableRows.forEach((r) => next.add(r.id));
    else tableRows.forEach((r) => next.delete(r.id));
    setSelectedIds(next);
  };

  const toggleOne = (id, checked) => {
    const next = new Set(selectedIds);
    checked ? next.add(id) : next.delete(id);
    setSelectedIds(next);
  };

  const headLine = { borderBottom: "1px solid", borderColor: "blackAlpha.600" };

  return (
    <Box p={6}>
      <Text fontWeight="bold" fontSize="20px">
        사원 승인 페이지 (근무내역)
      </Text>

      {/* ===== 상단 조회 영역 (그대로) ===== */}
      <Flex mt={4} gap={3} align="flex-start" wrap="wrap">
        <HStack spacing={3}>
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

          <Button
            size="sm"
            colorScheme="blue"
            onClick={() => fetchList()}
            isLoading={loading}
          >
            조회
          </Button>
        </HStack>
          {/* 👉 오른쪽 끝 */}
          <Box ml="auto">
  <Popover
    placement="bottom-end"
    isOpen={isCalendarOpen}
    onClose={closeCalendar}
  >
    <PopoverTrigger>
      <Button
        size="sm"
        variant="outline"
        onClick={openCalendar}
      >
        {rangeLabel}
      </Button>
    </PopoverTrigger>

    <PopoverContent w="auto">
      <PopoverArrow />
      <PopoverCloseButton />

      <PopoverBody>
        {/* 상단 버튼 */}
        <Flex justify="space-between" mb={2}>
          <Button
            size="xs"
            onClick={() => {
              const now = new Date();
              setRange({ from: now, to: now });
              closeCalendar();
            }}
          >
            Today
          </Button>
        </Flex>

        {/* 달력 */}
        <DayPicker
          mode="range"
          selected={range}
          onSelect={(r) => {
            if (!r?.from) return;

            setRange({
              from: r.from,
              to: r.to ?? r.from,
            });

            closeCalendar(); // ✅ 선택되면 바로 닫힘
          }}
        />
      </PopoverBody>
    </PopoverContent>
  </Popover>
</Box>
      </Flex>

      {/* ===== 테이블 ===== */}
      <Box mt={4} border="1px solid black" borderRadius="12px" overflow="hidden">
        <Table variant="simple" sx={{ tableLayout: "fixed" }}>
          <Thead bg="gray.50">
            <Tr>
              <Th w="40px" p="0" textAlign="center" {...headLine}>
                <Checkbox
                  size="sm"
                  isChecked={allChecked}
                  isIndeterminate={isIndeterminate}
                  onChange={(e) => toggleAll(e.target.checked)}
                />
              </Th>

              {/* ❌ 사번 제거 */}
              <Th {...headLine}>이름</Th>
              <Th {...headLine}>근무구분</Th> {/* ✅ 추가 */}
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
                  p="0"
                  textAlign="center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    size="sm"
                    isChecked={selectedIds.has(emp.id)}
                    onChange={(e) => toggleOne(emp.id, e.target.checked)}
                  />
                </Td>

                <Td>{emp.name}</Td>
                <Td fontWeight="bold">{emp.workType}</Td>
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

      {/* ===== 근무 상세 모달 (원본 그대로) ===== */}
      {selectedEmployee && (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>근무 상세 정보</ModalHeader>

            <ModalBody>
              {/* 📅 기본 정보 */}
              <InfoCard title="📅 근무 요약">
                <Flex justify="space-between">
                  <Box>
                    <Text fontSize="xs" color="gray.500">이름</Text>
                    <Text fontWeight="600">{selectedEmployee.name}</Text>
                  </Box>

                  <Box>
                    <Text fontSize="xs" color="gray.500">근무일</Text>
                    <Text fontWeight="600">{selectedEmployee.date}</Text>
                  </Box>

                  <Box>
                    <Text fontSize="xs" color="gray.500">근무구분</Text>
                    <Tag colorScheme="blue">{selectedEmployee.workType}</Tag>
                  </Box>
                </Flex>
              </InfoCard>

              {/* ⏰ 근무 시간 */}
              <InfoCard title="⏰ 근무 시간">
                <Flex justify="space-between">
                  <Box>
                    <Text fontSize="xs" color="gray.500">근무 시간</Text>
                    <Text fontWeight="600">{selectedEmployee.workTime}</Text>
                  </Box>

                  <Box textAlign="right">
                    <Text fontSize="xs" color="gray.500">총 근무</Text>
                    <Text fontWeight="700" color="blue.600">
                      {selectedEmployee.dayHM}
                    </Text>
                  </Box>
                </Flex>
              </InfoCard>

              {/* 🏢 근무 장소 */}
              <InfoCard title="🏢 근무 장소">
                <Text fontWeight="600">{selectedEmployee.location}</Text>
              </InfoCard>

              {/* 📋 근무 상세 */}
              <InfoCard title="📋 근무 상세">
                <Flex direction="column" gap={2}>
                  <Flex justify="space-between">
                    <Tag colorScheme="green">주간</Tag>
                    <Text fontWeight="600">{selectedEmployee.dayHM}</Text>
                  </Flex>

                  <Flex justify="space-between">
                    <Tag colorScheme="orange">잔업</Tag>
                    <Text fontWeight="600">
                      {selectedEmployee.overtimeChecked
                        ? selectedEmployee.overtimeDuration
                        : "없음"}
                    </Text>
                  </Flex>

                  <Flex justify="space-between">
                    <Tag colorScheme="purple">중식</Tag>
                    <Text fontWeight="600">
                      {selectedEmployee.lunchChecked
                        ? selectedEmployee.lunchDuration
                        : "없음"}
                    </Text>
                  </Flex>
                </Flex>
              </InfoCard>

              {/* ❌ 거절 사유 */}
              <InfoCard title="❌ 거절 사유">
                <Textarea
                  placeholder="거절 사유를 입력하세요"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  resize="none"
                />
              </InfoCard>
            </ModalBody>

           <ModalFooter>
            <Button
              colorScheme="green"
              mr={2}
              isLoading={saving}
              onClick={async () => {
                if (!selectedEmployee) return;

                setSaving(true);
                try {
                  await adminWorkdayStatusUpdate(
                    {
                      user_uuid: selectedEmployee.user_uuid,
                      work_date: selectedEmployee.date,
                      work_shift: selectedEmployee.workType,
                      status: "Y",
                    },
                    { toast }
                  );

                  toast({ title: "승인 완료", status: "success" });
                  onClose();
                  fetchList();
                } catch (e) {
                  toast({
                    title: "승인 실패",
                    description: e?.message || "승인 중 오류",
                    status: "error",
                  });
                } finally {
                  setSaving(false);
                }
              }}
            >
              승인
            </Button>

            <Button
              colorScheme="red"
              mr={2}
              isLoading={saving}
              onClick={async () => {
                if (!rejectReason.trim()) {
                  toast({
                    title: "거절 사유 필요",
                    status: "warning",
                  });
                  return;
                }

                setSaving(true);
                try {
                  await adminWorkdayStatusUpdate(
                    {
                      user_uuid: selectedEmployee.user_uuid,
                      work_date: selectedEmployee.date,
                      work_shift: selectedEmployee.workType,
                      status: "N",
                      reject_reason: rejectReason,
                    },
                    { toast }
                  );

                  toast({ title: "거절 완료", status: "success" });
                  onClose();
                  fetchList();
                } catch (e) {
                  toast({
                    title: "거절 실패",
                    description: e?.message || "거절 중 오류",
                    status: "error",
                  });
                } finally {
                  setSaving(false);
                }
              }}
            >
              거절
            </Button>

            <Button onClick={onClose}>닫기</Button>
          </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
}
