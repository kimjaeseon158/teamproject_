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
} from "@chakra-ui/react";

import { fetchWithAuth } from "../../api/fetchWithAuth"; // ✅ 경로 프로젝트에 맞게 조정

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
  // "2025-12-29T09:00:00+09:00" -> "2025-12-29"
  if (typeof value === "string" && value.includes("T")) return value.split("T")[0];
  // "2025-12-29 09:00:00" -> "2025-12-29"
  if (typeof value === "string" && value.includes(" ")) return value.split(" ")[0];
  return String(value);
};

// work_start/end에서 HH:MM만 (표시용)
const toTimeHM = (value) => {
  if (!value) return "";
  // "2025-12-29T09:00:00+09:00"
  if (typeof value === "string" && value.includes("T")) {
    const timePart = value.split("T")[1] || "";
    return timePart.slice(0, 5); // "09:00"
  }
  // "2025-12-29 09:00:00"
  if (typeof value === "string" && value.includes(" ")) {
    const timePart = value.split(" ")[1] || "";
    return timePart.slice(0, 5);
  }
  return "";
};

// 상태 태그 (일단 기본 "대기"로 두고 추후 서버값 연결)
const StatusTag = ({ status }) => {
  const cs =
    status === "승인" ? "green" : status === "거절" ? "red" : "yellow";
  return (
    <Tag size="sm" colorScheme={cs}>
      {status}
    </Tag>
  );
};

export default function ApprovePage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]); // 화면용 데이터
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();

  // ✅ 서버에서 조회
  useEffect(() => {
    const fetchList = async () => {
      try {
        setLoading(true);
        const res = await fetchWithAuth("/api/admin_page_workday/", {
          method: "GET",
        });

        if (!res.ok) {
          throw new Error("근무내역 조회 실패");
        }

        const json = await res.json();

        // 서버 응답 형태: { success:true, work_days:[...] }
        const workDays = json?.work_days || [];

        // ✅ 화면용으로 변환
        const mapped = workDays.map((w, idx) => {
          // 타입 이름은 서버 기준에 맞춰서 지정해야 함
          // (이미지 예시는 DAY/OVERTIME)
          // 너가 한글로 바꿨다면 "주간/잔업/특근/중식"으로 바꿔줘.
          const dayMins = getMinutesByType(w.details, "DAY") || getMinutesByType(w.details, "주간");
          const overtimeMins = getMinutesByType(w.details, "OVERTIME") || getMinutesByType(w.details, "잔업");
          const lunchMins = getMinutesByType(w.details, "LUNCH") || getMinutesByType(w.details, "중식");
          const extraMins = getMinutesByType(w.details, "EXTRA") || getMinutesByType(w.details, "특근");

          const startHM = toTimeHM(w.work_start);
          const endHM = toTimeHM(w.work_end);

          return {
            id: idx + 1,
            employeeNumber: w.employee_number,
            name: w.user_name,
            date: toDateOnly(w.work_date),
            location: w.work_place,

            // 표시용
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

            // 상태는 서버에 없으니 일단 "대기"
            status: "대기",
            raw: w, // 원본 보관(필요시)
          };
        });

        setRows(mapped);
      } catch (e) {
        console.error(e);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, []);

  const handleRowClick = (emp) => {
    setSelectedEmployee(emp);
    onOpen();
  };

  const tableRows = useMemo(() => rows, [rows]);

  return (
    <Box p={6}>
      <Text fontWeight="bold" fontSize="20px">
        사원 승인 페이지 (근무내역)
      </Text>

      {loading ? (
        <Flex mt={6} align="center" gap={3}>
          <Spinner />
          <Text>불러오는 중...</Text>
        </Flex>
      ) : (
        <Table mt={4} variant="striped">
          <Thead>
            <Tr>
              <Th>사번</Th>
              <Th>이름</Th>
              <Th>상태</Th>
              <Th>근무일</Th>
              <Th>주간(분)</Th>
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

      {/* 상세 모달 */}
      {selectedEmployee && (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>근무 상세 정보</ModalHeader>
            <ModalBody>
              <Box
                border="1px solid #ddd"
                borderRadius="8px"
                p={4}
                mb={4}
                bg="#f9f9f9"
              >
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
                    <strong>주간:</strong> {selectedEmployee.dayHM} (분)
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
                    {selectedEmployee.lunchChecked
                      ? selectedEmployee.lunchDuration
                      : "없음"}
                  </Box>
                  <Box flex="1">
                    <strong>특근:</strong>{" "}
                    {selectedEmployee.specialWorkChecked
                      ? selectedEmployee.specialWorkDuration
                      : "없음"}
                  </Box>
                </Flex>

                {/* 원본 필요하면 */}
                {/* <pre>{JSON.stringify(selectedEmployee.raw, null, 2)}</pre> */}
              </Box>
            </ModalBody>

            <ModalFooter>
              <Button
                colorScheme="green"
                mr={3}
                onClick={() => {
                  // TODO: 승인 API 붙일 자리
                  alert("승인 기능은 다음 단계에서 API 연결하면 됩니다.");
                }}
              >
                승인
              </Button>

              <Button
                colorScheme="red"
                mr={3}
                onClick={() => {
                  // TODO: 거절 API 붙일 자리
                  alert("거절 기능은 다음 단계에서 API 연결하면 됩니다.");
                }}
              >
                거절
              </Button>

              <Button colorScheme="gray" onClick={onClose}>
                닫기
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
}
