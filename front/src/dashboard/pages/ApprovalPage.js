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
                <span
                  style={{
                    padding: "4px 8px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    color:
                      emp.status === "승인"
                        ? "#276749"
                        : emp.status === "거절"
                        ? "#9b2c2c"
                        : "#744210",
                    backgroundColor:
                      emp.status === "승인"
                        ? "#c6f6d5"
                        : emp.status === "거절"
                        ? "#fed7d7"
                        : "#fefcbf",
                  }}
                >
                  {emp.status}
                </span>
              </Td>
              <Td>{emp.date}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* 상세 모달 */}
      {selectedEmployee && (
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>사원 상세 정보</ModalHeader>
            <ModalBody>
              <p>사번: {selectedEmployee.employeeNumber}</p>
              <p>이름: {selectedEmployee.name}</p>
              <p>상태: {selectedEmployee.status}</p>
              <p>신청일: {selectedEmployee.date}</p>
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
