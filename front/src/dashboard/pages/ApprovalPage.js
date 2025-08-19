// ApprovePage.js
import React, { useState } from "react";
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
} from "@chakra-ui/react";
import { employees } from "../js/employeeData";

export default function ApprovePage() {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleRowClick = (emp) => {
    setSelectedEmployee(emp);
    onOpen();
  };

  return (
    <Box p={6}>
      <h2 style={{ fontWeight: "bold", fontSize: "20px" }}>사원 승인 페이지</h2>
      <Table mt={4} variant="striped">
        <Thead>
          <Tr>
            <Th>사번</Th>
            <Th>이름</Th>
            <Th>상태</Th>
            <Th>신청일</Th>
          </Tr>
        </Thead>
        <Tbody>
          {employees.map((emp) => (
            <Tr
              key={emp.id}
              onClick={() => handleRowClick(emp)}
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
                <Tag
                  size="sm"
                  colorScheme={
                    emp.status === "승인"
                      ? "green"
                      : emp.status === "거절"
                      ? "red"
                      : "yellow"
                  }
                >
                  {emp.status}
                </Tag>
              </Td>
              <Td>{emp.date}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* 상세 모달 */}
      {selectedEmployee && (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>사원 상세 정보</ModalHeader>
            <ModalBody>
              <Box
                border="1px solid #ddd"
                borderRadius="8px"
                p={4}
                mb={4}
                bg="#f9f9f9"
              >
                <Flex mb={2}>
                  <Box flex="1"><strong>사번:</strong> {selectedEmployee.employeeNumber}</Box>
                  <Box flex="1"><strong>이름:</strong> {selectedEmployee.name}</Box>
                </Flex>
                <Flex mb={2}>
                  <Box flex="1">
                    <strong>상태:</strong>{" "}
                    <Tag
                      size="sm"
                      colorScheme={
                        selectedEmployee.status === "승인"
                          ? "green"
                          : selectedEmployee.status === "거절"
                          ? "red"
                          : "yellow"
                      }
                    >
                      {selectedEmployee.status}
                    </Tag>
                  </Box>
                  <Box flex="1"><strong>신청일:</strong> {selectedEmployee.date}</Box>
                </Flex>
                <Flex mb={2}>
                  <Box flex="1"><strong>작업시간:</strong> {selectedEmployee.workTime}</Box>
                  <Box flex="1"><strong>업체명/위치:</strong> {selectedEmployee.location}</Box>
                </Flex>
                <Flex mb={2}>
                  <Box flex="1">
                    <strong>잔업:</strong>{" "}
                    {selectedEmployee.overtimeChecked
                      ? selectedEmployee.overtimeDuration
                      : "없음"}
                  </Box>
                  <Box flex="1">
                    <strong>중식:</strong>{" "}
                    {selectedEmployee.lunchChecked
                      ? selectedEmployee.lunchDuration
                      : "없음"}
                  </Box>
                </Flex>
                <Box flex="1">
                  <strong>특근:</strong>{" "}
                  {selectedEmployee.specialWorkChecked
                    ? selectedEmployee.specialWorkDuration
                    : "없음"}
                </Box>
              </Box>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="green" mr={3}>
                승인
              </Button>
              <Button colorScheme="red" mr={3}>
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
