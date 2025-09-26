// src/pages/ExpensePage.js
import React, { useState, useEffect } from "react";
import {
  Box, Flex, Heading, Button, VStack, HStack,
  Input, NumberInput, NumberInputField,
  useColorModeValue, useDisclosure, useToast,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, Table, Thead, Tbody,
  Tr, Th, Td, TableContainer, Card, CardBody, Stat, StatLabel, StatNumber,
  IconButton
} from "@chakra-ui/react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { expense_filter_Data } from "../js/expense_filter";
import { expense_Data } from "../js/expense_API";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { CloseIcon } from "@chakra-ui/icons";

const COLORS = ["#E74C3C", "#F39C12", "#9B59B6", "#3182CE", "#2ECC71"];

export default function ExpensePage() {
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const toast = useToast();

  const { isOpen: isRangeOpen, onOpen: onRangeOpen, onClose: onRangeClose } = useDisclosure();
  const { isOpen: isExpenseOpen, onOpen: onExpenseOpen, onClose: onExpenseClose } = useDisclosure();

  const [range, setRange] = useState({ from: new Date(), to: new Date() });
  const [tempRange, setTempRange] = useState(range);

  const [expenseData, setExpenseData] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);

  // 모달에서 여러 지출 항목 관리
  const [expenseList, setExpenseList] = useState([
    { name: "", detail: "", amount: "", date: new Date() }
  ]);

  // 데이터 fetch
  const handleFetch = async (start, end) => {
    const result = await expense_filter_Data({ start, end }, toast);
    if (!result || !result.data) {
      setExpenseData([]);
      setTotalExpense(0);
      return;
    }
    const expData = result.data.map(r => ({
      name: r.expense_name,
      detail: r.expense_detail,
      amount: r.amount,
      date: r.date,
    }));
    setExpenseData(expData);
    setTotalExpense(expData.reduce((acc, cur) => acc + cur.amount, 0));
  };

  useEffect(() => {
    handleFetch(range.from, range.to);
  }, []);

  // 모달 항목 추가/삭제
  const addExpenseRow = () => setExpenseList([...expenseList, { name: "", detail: "", amount: "", date: new Date() }]);
  const removeExpenseRow = (index) => setExpenseList(expenseList.filter((_, i) => i !== index));

  // 지출 추가
  const handleAddExpense = async () => {
    // 최소 한 항목 이름/금액 확인
    if (expenseList.some(e => !e.name || !e.amount)) {
      toast({ title: "입력 오류", description: "모든 항목에 이름과 금액을 입력하세요", status: "warning" });
      return;
    }

    try {
      // 각 항목 POST
      for (const item of expenseList) {
        const payload = {
          date: item.date.toISOString().split("T")[0],
          expense_name: item.name,
          expense_detail: item.detail,
          amount: Number(item.amount),
        };
        await expense_Data(payload, toast);
      }

      // 다시 fetch
      await handleFetch(range.from, range.to);
      setExpenseList([{ name: "", detail: "", amount: "", date: new Date() }]);
      onExpenseClose();
      toast({ title: "추가 완료", status: "success" });
    } catch (error) {
      console.error(error);
      toast({ title: "오류", description: "서버와 통신 중 오류가 발생했습니다.", status: "error" });
    }
  };

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <Flex gap={6}>
        {/* 왼쪽 - 지출 테이블 */}
        <Box flex="2" bg={cardBg} border="1px solid" borderColor={cardBorder} p={6} rounded="2xl" shadow="sm">
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="md">지출 내역</Heading>
            <Button size="sm" onClick={onRangeOpen}>
              {range.from.toLocaleDateString()} - {range.to.toLocaleDateString()}
            </Button>
          </Flex>

          <Button colorScheme="red" mb={4} onClick={onExpenseOpen}>지출 추가</Button>

          <TableContainer borderRadius="lg" overflow="hidden" border="1px solid" borderColor="gray.200">
            <Table variant="simple" size="md">
              <Thead bg="gray.100">
                <Tr>
                  <Th>항목</Th>
                  <Th>상세</Th>
                  <Th isNumeric>금액</Th>
                </Tr>
              </Thead>
              <Tbody>
                {expenseData.map((item, idx) => (
                  <Tr key={idx} _hover={{ bg: "gray.50" }}>
                    <Td fontWeight="bold">{item.name}</Td>
                    <Td>{item.detail || "-"}</Td>
                    <Td isNumeric>{item.amount.toLocaleString()} 원</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>

        {/* 오른쪽 - Pie + 총액 */}
        <Box flex="1" display="flex" flexDirection="column" gap={6}>
          <Card shadow="sm" rounded="2xl" p={4} flex="1">
            <CardBody>
              <Heading size="sm" mb={4}>지출 비율 (도넛)</Heading>
              <Box w="100%" h="250px">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={expenseData}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      label
                    >
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

      {/* 기간 선택 모달 */}
      <Modal isOpen={isRangeOpen} onClose={onRangeClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>기간 선택</ModalHeader>
          <ModalBody>
            <DayPicker
              mode="range"
              selected={tempRange}
              onSelect={(r) => setTempRange(r || { from: null, to: null })}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={() => {
              if (tempRange.from && tempRange.to) {
                setRange(tempRange);
                handleFetch(tempRange.from, tempRange.to);
                onRangeClose();
              }
            }}>적용</Button>
            <Button onClick={onRangeClose}>취소</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 지출 추가 모달 */}
      <Modal isOpen={isExpenseOpen} onClose={onExpenseClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>지출 추가</ModalHeader>
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {expenseList.map((item, idx) => (
                <Box key={idx} p={3} bg={cardBg} border="1px solid" borderColor={cardBorder} rounded="lg">
                  <HStack spacing={2} mb={2}>
                    <Input
                      type="date"
                      value={item.date.toISOString().split("T")[0]}
                      onChange={(e) => {
                        const newList = [...expenseList];
                        newList[idx].date = new Date(e.target.value);
                        setExpenseList(newList);
                      }}
                    />
                    <IconButton
                      aria-label="삭제"
                      icon={<CloseIcon />}
                      size="sm"
                      colorScheme="red"
                      onClick={() => removeExpenseRow(idx)}
                    />
                  </HStack>
                  <Input
                    placeholder="지출 항목"
                    value={item.name}
                    mb={2}
                    onChange={(e) => {
                      const newList = [...expenseList];
                      newList[idx].name = e.target.value;
                      setExpenseList(newList);
                    }}
                  />
                  <Input
                    placeholder="상세 내용"
                    value={item.detail}
                    mb={2}
                    onChange={(e) => {
                      const newList = [...expenseList];
                      newList[idx].detail = e.target.value;
                      setExpenseList(newList);
                    }}
                  />
                  <NumberInput
                    value={item.amount}
                    onChange={(val) => {
                      const newList = [...expenseList];
                      newList[idx].amount = val;
                      setExpenseList(newList);
                    }}
                  >
                    <NumberInputField placeholder="금액 (원)" />
                  </NumberInput>
                </Box>
              ))}
              <Button colorScheme="blue" variant="outline" onClick={addExpenseRow}>
                + 항목 추가
              </Button>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={handleAddExpense}>추가</Button>
            <Button onClick={onExpenseClose}>취소</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
