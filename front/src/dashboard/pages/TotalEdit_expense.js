// src/pages/ExpensePage.js
import React, { useState, useEffect } from "react";
import {
  Box, Flex, Heading, Button, VStack,
  Input, NumberInput, NumberInputField, useColorModeValue,
  useToast, Checkbox, CheckboxGroup, Stack,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Table, Thead, Tbody, Tr, Th, Td, TableContainer,
  Card, CardBody, Stat, StatLabel, StatNumber,
  useDisclosure
} from "@chakra-ui/react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { expense_filter_Data } from "../js/expense_filter";
import { expense_Data } from "../js/expense_API";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { ArrowForwardIcon, EditIcon } from "@chakra-ui/icons";

const COLORS = ["#E74C3C", "#F39C12", "#9B59B6", "#3182CE", "#2ECC71"];

export default function ExpensePage() {
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const toast = useToast();

  const { isOpen: isRangeOpen, onOpen: onRangeOpen, onClose: onRangeClose } = useDisclosure();
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

  const [range, setRange] = useState({ from: undefined, to: undefined });
  const [expenseData, setExpenseData] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);

  // 지출 추가 상태
  const [expenseInput, setExpenseInput] = useState({ name: "", detail: "", amount: "", date: new Date() });
  const [tempList, setTempList] = useState([]); // 보류 리스트
  const [selectedTemp, setSelectedTemp] = useState([]);
  const [finalList, setFinalList] = useState([]);
  const [selectedFinal, setSelectedFinal] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({ name: "", detail: "", amount: "", date: new Date() });

  // ===========================
  // 서버 데이터 fetch
  // ===========================
  useEffect(() => {
    const fetchData = async () => {
      if (!range.from || !range.to) return;
      const result = await expense_filter_Data({ start: range.from, end: range.to }, toast);
      if (!result || !result.data) {
        setExpenseData([]);
        setTotalExpense(0);
        return;
      }
      const expData = result.data.map(r => ({
        name: r.expense_name,
        detail: r.expense_detail,
        amount: r.amount,
        date: new Date(r.date),
      }));
      setExpenseData(expData);
      setTotalExpense(expData.reduce((acc, cur) => acc + cur.amount, 0));
    };
    fetchData();
  }, [range, toast]);

  // ===========================
  // 임시 → 최종 이동 및 저장
  // ===========================
  const handleAddTemp = () => {
    if (!expenseInput.name || !expenseInput.amount) {
      toast({ title: "입력 오류", description: "항목명과 금액은 필수입니다", status: "warning" });
      return;
    }
    setTempList([...tempList, expenseInput]);
    setExpenseInput({ name: "", detail: "", amount: "", date: new Date() });
  };

  const handleMoveSelected = () => {
    const toMove = tempList.filter((_, idx) => selectedTemp.includes(idx.toString()));
    const remain = tempList.filter((_, idx) => !selectedTemp.includes(idx.toString()));
    setFinalList([...finalList, ...toMove]);
    setTempList(remain);
    setSelectedTemp([]);
  };

  const handleMoveBack = () => {
    const toMove = finalList.filter((_, idx) => selectedFinal.includes(idx.toString()));
    const remain = finalList.filter((_, idx) => !selectedFinal.includes(idx.toString()));
    setTempList([...tempList, ...toMove]);
    setFinalList(remain);
    setSelectedFinal([]);
  };

  const handleRegisterFinal = async () => {
    if (finalList.length === 0) return;
    try {
      for (const item of finalList) {
        const payload = {
          date: item.date.toISOString().split("T")[0],
          expense_name: item.name,
          expense_detail: item.detail,
          amount: Number(item.amount),
        };
        await expense_Data(payload, toast);
      }
      setTempList([]);
      setFinalList([]);
      onAddClose();
      toast({ title: "저장 완료", status: "success" });
    } catch (err) {
      console.error(err);
      toast({ title: "오류", description: "서버 저장 실패", status: "error" });
    }
  };

  const handleEditClick = (idx) => {
    setEditIndex(idx);
    setEditData(expenseData[idx]);
    onEditOpen();
  };

  const handleEditSave = () => {
    const updated = [...expenseData];
    updated[editIndex] = editData;
    setExpenseData(updated);
    onEditClose();
  };

  const handleRowSelect = (idx, checked) => {
    if (checked) {
      setFinalList([...finalList, expenseData[idx]]);
    } else {
      setFinalList(finalList.filter(f => f !== expenseData[idx]));
    }
  };

  const handleRowClick = (idx) => {
    setEditIndex(idx);
    setEditData(expenseData[idx]);
    onEditOpen();
  };

  // ===========================
  // 렌더링
  // ===========================
  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <Flex gap={6} flexWrap="wrap">
        {/* 왼쪽 - 테이블 */}
        <Box flex="2" minW="400px" bg={cardBg} border="1px solid" borderColor={cardBorder} p={6} rounded="2xl" shadow="sm">
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="md">지출 내역</Heading>
            <Button size="sm" onClick={onRangeOpen}>
              {range.from ? range.from.toLocaleDateString() : "시작"} - {range.to ? range.to.toLocaleDateString() : "종료"}
            </Button>
          </Flex>

          <Button colorScheme="red" mb={4} onClick={onAddOpen}>지출 추가</Button>

          <TableContainer borderRadius="lg" overflow="hidden" border="1px solid" borderColor="gray.200">
            <Table variant="simple" size="md">
              <Thead bg="gray.100">
                <Tr>
                  <Th>선택</Th>
                  <Th>날짜</Th>
                  <Th>항목</Th>
                  <Th>상세</Th>
                  <Th isNumeric>금액</Th>
                </Tr>
              </Thead>
              <Tbody>
                {expenseData.map((item, idx) => (
                  <Tr key={idx} _hover={{ bg: "gray.50" }} onClick={() => handleRowClick(idx)}>
                    <Td>
                      <Checkbox
                        isChecked={finalList.includes(item)}
                        onChange={(e) => handleRowSelect(idx, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Td>
                    <Td>{item.date.toLocaleDateString()}</Td>
                    <Td>{item.name}</Td>
                    <Td>{item.detail || "-"}</Td>
                    <Td isNumeric>{item.amount.toLocaleString()} 원</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>

        {/* 오른쪽 - 차트 */}
        <Box flex="1" display="flex" flexDirection="column" gap={6} minW="300px">
          <Card shadow="sm" rounded="2xl" p={4} flex="1">
            <CardBody>
              <Heading size="sm" mb={4}>지출 비율 (도넛)</Heading>
              <Box w="100%" h="250px">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={expenseData} dataKey="amount" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} label>
                      {expenseData.map((_, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardBody>
          </Card>

          <Card shadow="sm" rounded="2xl" p={4} textAlign="center">
            <CardBody>
              <Stat>
                <StatLabel>총 지출 금액</StatLabel>
                <StatNumber color="red.500">{totalExpense.toLocaleString()} 원</StatNumber>
              </Stat>
            </CardBody>
          </Card>
        </Box>
      </Flex>

      {/* ===========================
          기간 선택 모달
      =========================== */}
      <Modal isOpen={isRangeOpen} onClose={onRangeClose} size={["full", "md", "lg"]} isCentered>
        <ModalOverlay />
        <ModalContent maxW={{ base: "95%", md: "600px" }} borderRadius="2xl">
          <ModalHeader>기간 선택</ModalHeader>
          <ModalBody>
            <DayPicker
              mode="range"
              selected={range.from && range.to ? range : undefined}
              onSelect={(r) => setRange(r || { from: undefined, to: undefined })}
            />
          </ModalBody>
          <ModalFooter>
            <Button onClick={onRangeClose}>닫기</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ===========================
          지출 추가 모달
      =========================== */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} size="6xl" isCentered>
        <ModalOverlay />
        <ModalContent w={{ base: "95%", md: "90%", lg: "85%" }} h={{ base: "95vh", md: "90vh", lg: "85vh" }} overflowY="auto" borderRadius="2xl" p={4}>
          <ModalHeader fontSize="xl" fontWeight="bold">지출 추가</ModalHeader>
          <ModalBody>
            <Flex gap={4} minH="400px" align="stretch">
              {/* 왼쪽 - 입력 + 보류 리스트 */}
              <Box flex="1" minW="300px" maxH="70vh" overflowY="auto">
                <VStack spacing={3} align="stretch">
                  <Input type="date" value={expenseInput.date.toISOString().split("T")[0]} onChange={(e) => setExpenseInput({ ...expenseInput, date: new Date(e.target.value) })} />
                  <Input placeholder="항목명" value={expenseInput.name} onChange={(e) => setExpenseInput({ ...expenseInput, name: e.target.value })} />
                  <Input placeholder="상세 내용" value={expenseInput.detail} onChange={(e) => setExpenseInput({ ...expenseInput, detail: e.target.value })} />
                  <NumberInput value={expenseInput.amount} onChange={(val) => setExpenseInput({ ...expenseInput, amount: val })}>
                    <NumberInputField placeholder="금액 (원)" />
                  </NumberInput>
                  <Button colorScheme="blue" onClick={handleAddTemp}>보류 추가</Button>
                </VStack>

                <VStack mt={4} align="stretch" spacing={2}>
                  <Heading size="sm">보류 리스트</Heading>
                  {tempList.length === 0 && <Box color="gray.500">추가된 항목이 없습니다.</Box>}
                  <CheckboxGroup value={selectedTemp} onChange={setSelectedTemp}>
                    <Stack>
                      {tempList.map((item, idx) => (
                        <Flex key={idx} justify="space-between" align="center">
                          <Checkbox value={idx.toString()}>{item.name} ({item.amount}원)</Checkbox>
                        </Flex>
                      ))}
                    </Stack>
                  </CheckboxGroup>
                </VStack>
              </Box>

              {/* 중앙 버튼 */}
              <Flex flexDirection="column" justify="center" align="center" gap={4}>
                <Button colorScheme="blue" onClick={handleMoveSelected} isDisabled={selectedTemp.length === 0} w="50px" h="40px">
                  <ArrowForwardIcon boxSize={4} />
                </Button>
                <Button colorScheme="orange" onClick={handleMoveBack} isDisabled={selectedFinal.length === 0} w="50px" h="40px">
                  <ArrowForwardIcon boxSize={4} style={{ transform: "rotate(180deg)" }} />
                </Button>
              </Flex>

              {/* 오른쪽 - 최종 리스트 */}
              <Box flex="1" minW="300px" display="flex" flexDirection="column" maxH="70vh">
                <Heading size="sm" mb={2}>최종 리스트</Heading>
                <Box flex="1" overflowY="auto">
                  {finalList.length === 0 && <Box color="gray.500">아직 이동된 항목이 없습니다.</Box>}
                  <CheckboxGroup value={selectedFinal} onChange={setSelectedFinal}>
                    <Stack>
                      {finalList.map((item, idx) => (
                        <Checkbox key={idx} value={idx.toString()}>
                          {item.name} ({item.amount}원)
                        </Checkbox>
                      ))}
                    </Stack>
                  </CheckboxGroup>
                </Box>
              </Box>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" mr={3} onClick={handleRegisterFinal}>최종 저장</Button>
            <Button onClick={onAddClose}>취소</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ===========================
          수정 모달
      =========================== */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="sm" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>항목 수정</ModalHeader>
          <ModalBody>
            <VStack spacing={3} align="stretch">
              <Input placeholder="항목명" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
              <Input placeholder="상세 내용" value={editData.detail} onChange={(e) => setEditData({ ...editData, detail: e.target.value })} />
              <NumberInput value={editData.amount} onChange={(val) => setEditData({ ...editData, amount: val })}>
                <NumberInputField placeholder="금액 (원)" />
              </NumberInput>
              <Input type="date" value={editData.date.toISOString().split("T")[0]} onChange={(e) => setEditData({ ...editData, date: new Date(e.target.value) })} />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleEditSave}>저장</Button>
            <Button onClick={onEditClose}>취소</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
