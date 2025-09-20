// src/components/ContractLayout.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Divider,
  VStack,
  HStack,
  Input,
  NumberInput,
  NumberInputField,
  useColorModeValue,
  useDisclosure,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { fetchTotalData } from "../../api/fetchTotalData";
import { income_Data } from "../js/company_api";
import { expense_Data } from "../js/expense_API";

export default function ContractLayout() {
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const boxBg = useColorModeValue("gray.100", "gray.700");

  const toast = useToast();

  // 메인 기간 선택 모달
  const { isOpen: isRangeOpen, onOpen: onRangeOpen, onClose: onRangeClose } = useDisclosure();
  // 지출 모달
  const { isOpen: isExpenseOpen, onOpen: onExpenseOpen, onClose: onExpenseClose } = useDisclosure();
  // 업체 모달
  const { isOpen: isCompanyOpen, onOpen: onCompanyOpen, onClose: onCompanyClose } = useDisclosure();

  const [range, setRange] = useState({ from: new Date(), to: new Date() });
  const [tempRange, setTempRange] = useState(range);

  const [expenses, setExpenses] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [profit, setProfit] = useState(0);

  // 입력 상태
  const [expenseName, setExpenseName] = useState("");
  const [expenseDetail, setExpenseDetail] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(new Date());

  const [companyName, setCompanyName] = useState("");
  const [companyDetail, setCompanyDetail] = useState("");
  const [companyAmount, setCompanyAmount] = useState("");
  const [companyDate, setCompanyDate] = useState(new Date());

  // 서버에서 데이터 가져오기
  const handleFetch = async (start, end) => {
    const result = await fetchTotalData({ start, end, toast });
    if (!result) return;

    const expData = result.expenseData.map((e) => ({ name: e.name, amount: e.value }));
    const incData = result.revenueByCompany.map((r) => ({ name: r.name, amount: r.value }));

    setExpenses(expData);
    setIncomeData(incData);

    const expSum = expData.reduce((acc, cur) => acc + cur.amount, 0);
    const incSum = incData.reduce((acc, cur) => acc + cur.amount, 0);

    setTotalExpense(expSum);
    setTotalIncome(incSum);
    setProfit(incSum - expSum);
  };

  useEffect(() => {
    handleFetch(range.from, range.to);
  }, []);

  // 지출 추가
  const handleAddExpense = async () => {
    if (!expenseName || !expenseAmount) {
      toast({ title: "입력 오류", description: "지출 항목과 금액을 입력하세요", status: "warning", duration: 3000, isClosable: true });
      return;
    }

    const payload = {
      date: expenseDate.toISOString().split("T")[0],
      expense_name: expenseName,
      expense_detail: expenseDetail,
      amount: Number(expenseAmount),
    };

    const result = await expense_Data(payload, toast);
    if (result) {
      const updated = [...expenses, { name: expenseName, amount: Number(expenseAmount) }];
      setExpenses(updated);
      setExpenseName("");
      setExpenseDetail("");
      setExpenseAmount("");
      const newTotal = updated.reduce((acc, cur) => acc + cur.amount, 0);
      setTotalExpense(newTotal);
      setProfit(totalIncome - newTotal);
      onExpenseClose();
    }
  };

  // 업체 추가
  const handleAddCompany = async () => {
    if (!companyName || !companyAmount) {
      toast({ title: "입력 오류", description: "회사명과 금액을 입력하세요", status: "warning", duration: 3000, isClosable: true });
      return;
    }

    const payload = {
      date: companyDate.toISOString().split("T")[0],
      company_name: companyName,
      company_detail: companyDetail,
      amount: Number(companyAmount),
    };

    const result = await income_Data(payload, toast);
    if (result) {
      const updated = [...incomeData, { name: companyName, amount: Number(companyAmount) }];
      setIncomeData(updated);
      setCompanyName("");
      setCompanyDetail("");
      setCompanyAmount("");
      const newTotal = updated.reduce((acc, cur) => acc + cur.amount, 0);
      setTotalIncome(newTotal);
      setProfit(newTotal - totalExpense);
      onCompanyClose();
    }
  };

  return (
    <Flex p={6} gap={6} bg="gray.50" minH="100vh">
      {/* 좌측 영역 (수익/업체) */}
      <Box flex="2" bg={cardBg} border="1px solid" borderColor={cardBorder} p={6} rounded="2xl" shadow="sm">
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md">계약 금액</Heading>
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
              <Button colorScheme="blue" mr={3} onClick={() => { if (tempRange.from && tempRange.to) { setRange(tempRange); handleFetch(tempRange.from, tempRange.to); onRangeClose(); }}}>
                적용
              </Button>
              <Button onClick={onRangeClose}>취소</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Text fontSize="2xl" fontWeight="bold" color="blue.600" mb={4}>
          {totalIncome.toLocaleString()} 원
        </Text>

        <Divider my={4} />

        <Button colorScheme="green" mb={2} onClick={onCompanyOpen}>업체 추가</Button>

        {/* 업체 추가 모달 */}
       <Modal isOpen={isCompanyOpen} onClose={onCompanyClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>업체 추가</ModalHeader>
          <ModalBody>
            <VStack spacing={3}>
              {/* 기존 DayPicker 대신 심플한 date input */}
              <Input
                type="date"
                value={companyDate.toISOString().split("T")[0]}
                onChange={(e) => setCompanyDate(new Date(e.target.value))}
              />
              <Input placeholder="회사명" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              <Input placeholder="회사 상세" value={companyDetail} onChange={(e) => setCompanyDetail(e.target.value)} />
              <NumberInput value={companyAmount} onChange={(val) => setCompanyAmount(val)}>
                <NumberInputField placeholder="금액 (원)" />
              </NumberInput>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" mr={3} onClick={handleAddCompany}>추가</Button>
            <Button onClick={onCompanyClose}>취소</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

        {/* 회사별 금액 */}
        <VStack align="stretch" spacing={3}>
          <Text fontWeight="bold" mb={2}>회사별 금액</Text>
          {incomeData.map((item, idx) => (
            <HStack key={idx} justify="space-between" p={3} bg={boxBg} rounded="lg">
              <Box>
                <Text fontWeight="bold">{item.name}</Text>
                <Text fontSize="sm" color="gray.500">{item.amount.toLocaleString()} 원</Text>
              </Box>
            </HStack>
          ))}
        </VStack>
      </Box>

      {/* 우측 영역 (지출) */}
      <Box flex="1.5" bg={cardBg} border="1px solid" borderColor={cardBorder} p={6} rounded="2xl" shadow="sm">
        <Heading size="md" mb={4}>지출 내역</Heading>
        <Text fontSize="lg" fontWeight="bold" color="red.500">총 지출금액 {totalExpense.toLocaleString()} 원</Text>

        <Button colorScheme="blue" mb={2} onClick={onExpenseOpen}>지출 추가</Button>

        {/* 지출 추가 모달 */}
        <Modal isOpen={isExpenseOpen} onClose={onExpenseClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>지출 추가</ModalHeader>
            <ModalBody>
              <VStack spacing={3}>
                {/* 기존 DayPicker 대신 심플한 date input */}
                <Input
                  type="date"
                  value={expenseDate.toISOString().split("T")[0]}
                  onChange={(e) => setExpenseDate(new Date(e.target.value))}
                />
                <Input placeholder="지출 항목" value={expenseName} onChange={(e) => setExpenseName(e.target.value)} />
                <Input placeholder="상세 내용" value={expenseDetail} onChange={(e) => setExpenseDetail(e.target.value)} />
                <NumberInput value={expenseAmount} onChange={(val) => setExpenseAmount(val)}>
                  <NumberInputField placeholder="금액 (원)" />
                </NumberInput>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={handleAddExpense}>추가</Button>
              <Button onClick={onExpenseClose}>취소</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Text fontSize="sm" color="gray.600" mb={4}>순이익 {profit.toLocaleString()} 원</Text>
        <Divider my={4} />

        <VStack align="stretch" spacing={3}>
          {expenses.map((item, idx) => (
            <HStack key={idx} justify="space-between">
              <Text>{item.name}</Text>
              <Text color="gray.700" fontWeight="bold">{item.amount.toLocaleString()} 원</Text>
            </HStack>
          ))}
        </VStack>
      </Box>
    </Flex>
  );
}
