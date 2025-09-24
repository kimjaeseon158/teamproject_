// src/pages/ExpensePage.js
import React, { useState, useEffect } from "react";
import {
  Box, Flex, Heading, Text, Button, Divider, VStack, HStack,
  Input, NumberInput, NumberInputField, useColorModeValue,
  useDisclosure, useToast, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalBody, ModalFooter
} from "@chakra-ui/react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { expense_filter_Data } from "../js/expense_filter"; // POST 함수 사용

export default function ExpensePage() {
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const boxBg = useColorModeValue("gray.100", "gray.700");

  const toast = useToast();

  // 모달 상태
  const { isOpen: isRangeOpen, onOpen: onRangeOpen, onClose: onRangeClose } = useDisclosure();
  const { isOpen: isExpenseOpen, onOpen: onExpenseOpen, onClose: onExpenseClose } = useDisclosure();

  // 기간 선택
  const [range, setRange] = useState({ from: new Date(), to: new Date() });
  const [tempRange, setTempRange] = useState(range);

  // 데이터
  const [expenseData, setExpenseData] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);

  // 지출 입력 상태
  const [expenseName, setExpenseName] = useState("");
  const [expenseDetail, setExpenseDetail] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(new Date());

  // 데이터 fetch (POST)
  // handleFetch
    const handleFetch = async (start, end) => {
        const result = await expense_filter_Data({ start, end }, toast);
        if (!result || !result.data) return;
        const expData = result.data.map(r => ({
            name: r.expense_name,
            amount: r.amount,
            date: r.date,
            detail: r.expense_detail,
        }));
        setExpenseData(expData);
        setTotalExpense(expData.reduce((acc, cur) => acc + cur.amount, 0));
    };

    useEffect(() => {
        handleFetch(range.from, range.to);
    }, []);

    
  // 지출 추가
  const handleAddExpense = async () => {
    if (!expenseName || !expenseAmount) {
      toast({ title: "입력 오류", description: "지출 항목과 금액을 입력하세요", status: "warning" });
      return;
    }
    const payload = {
      date: expenseDate.toISOString().split("T")[0],
      expense_name: expenseName,
      expense_detail: expenseDetail,
      amount: Number(expenseAmount),
    };
    const result = await expense_filter_Data(payload, toast);
    if (result) {
      // 추가 후 다시 범위에 맞춰 fetch
      handleFetch(range.from, range.to);
      setExpenseName(""); setExpenseDetail(""); setExpenseAmount("");
      onExpenseClose();
    }
  };

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <Box bg={cardBg} border="1px solid" borderColor={cardBorder} p={6} rounded="2xl" shadow="sm">
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md">지출 내역</Heading>
          <Button size="sm" onClick={onRangeOpen}>
            {range.from.toLocaleDateString()} - {range.to.toLocaleDateString()}
          </Button>
        </Flex>

        {/* 기간 선택 모달 */}
        <Modal isOpen={isRangeOpen} onClose={onRangeClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>기간 선택</ModalHeader>
            <ModalBody>
              <DayPicker mode="range" selected={tempRange} onSelect={(r) => setTempRange(r || { from: null, to: null })} />
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" onClick={() => {
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

        <Text fontSize="2xl" fontWeight="bold" color="red.500" mb={4}>
          {totalExpense.toLocaleString()} 원
        </Text>
        <Divider my={4} />

        <Button colorScheme="red" mb={4} onClick={onExpenseOpen}>지출 추가</Button>

        {/* 지출 추가 모달 */}
        <Modal isOpen={isExpenseOpen} onClose={onExpenseClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>지출 추가</ModalHeader>
            <ModalBody>
              <VStack spacing={3}>
                <Input type="date" value={expenseDate.toISOString().split("T")[0]} onChange={(e) => setExpenseDate(new Date(e.target.value))} />
                <Input placeholder="지출 항목" value={expenseName} onChange={(e) => setExpenseName(e.target.value)} />
                <Input placeholder="상세 내용" value={expenseDetail} onChange={(e) => setExpenseDetail(e.target.value)} />
                <NumberInput value={expenseAmount} onChange={(val) => setExpenseAmount(val)}>
                  <NumberInputField placeholder="금액 (원)" />
                </NumberInput>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="red" onClick={handleAddExpense}>추가</Button>
              <Button onClick={onExpenseClose}>취소</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <VStack align="stretch" spacing={3}>
          {expenseData.map((item, idx) => (
            <HStack key={idx} justify="space-between" p={3} bg={boxBg} rounded="lg">
              <Text fontWeight="bold">{item.name}</Text>
              <Text color="gray.500">{item.amount.toLocaleString()} 원</Text>
            </HStack>
          ))}
        </VStack>
      </Box>
    </Box>
  );
}
