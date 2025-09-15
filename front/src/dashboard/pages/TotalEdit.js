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
  Stack,
  Tag,
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
import { fetchTotalData } from "../../api/fetchTotalData"; // 서버 fetch 함수

export default function ContractLayout() {
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const boxBg = useColorModeValue("gray.100", "gray.700");

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [range, setRange] = useState({ from: new Date(), to: new Date() });
  const [tempRange, setTempRange] = useState(range);

  const [expenses, setExpenses] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [profit, setProfit] = useState(0);

  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");

  // 서버에서 데이터 가져오기
  const handleFetch = async (start, end) => {
    const result = await fetchTotalData({ start, end, toast });
    if (!result) return;

    const expData = result.expenseData.map((e) => ({
      name: e.name,
      amount: e.value,
    }));
    const incData = result.revenueByCompany.map((r) => ({
      name: r.name,
      amount: r.value,
    }));

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

  const handleAddExpense = () => {
    if (!newName || !newAmount) return;
    const updated = [...expenses, { name: newName, amount: Number(newAmount) }];
    setExpenses(updated);
    setNewName("");
    setNewAmount("");
    const newTotal = updated.reduce((acc, cur) => acc + cur.amount, 0);
    setTotalExpense(newTotal);
    setProfit(totalIncome - newTotal);
  };

  return (
    <Flex p={6} gap={6} bg="gray.50" minH="100vh">
      {/* 좌측 영역 */}
      <Box
        flex="2"
        bg={cardBg}
        border="1px solid"
        borderColor={cardBorder}
        p={6}
        rounded="2xl"
        shadow="sm"
      >
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md">계약 금액</Heading>
          <Button size="sm" onClick={onOpen}>
            {range.from.toLocaleDateString()} - {range.to.toLocaleDateString()}
          </Button>
        </Flex>

        <Modal isOpen={isOpen} onClose={onClose}>
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
              <Button
                colorScheme="blue"
                mr={3}
                onClick={() => {
                  if (tempRange.from && tempRange.to) {
                    setRange(tempRange);
                    handleFetch(tempRange.from, tempRange.to);
                    onClose();
                  }
                }}
              >
                적용
              </Button>
              <Button onClick={onClose}>취소</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Text fontSize="2xl" fontWeight="bold" color="blue.600" mb={4}>
          {totalIncome.toLocaleString()} 원
        </Text>

        <Divider my={4} />

        <VStack align="stretch" spacing={4}>
          <Box>
            <Text fontWeight="bold">정산 형태</Text>
            <HStack mt={1}>
              <Tag colorScheme="blue">착수금</Tag>
              <Tag colorScheme="green">잔금</Tag>
            </HStack>
          </Box>

          <Box>
            <Text fontWeight="bold">정산 날짜</Text>
            <Text fontSize="sm">2024년 8월 6일</Text>
          </Box>

          <Button colorScheme="red" size="sm" mt={2}>
            계약금 정보 수정하기
          </Button>
        </VStack>

        <Divider my={6} />

        <Heading size="sm" mb={2}>
          정산
        </Heading>
        <Stack spacing={3}>
          <Box>
            <Text fontWeight="bold">총 정산 금액</Text>
            <Text>{totalIncome.toLocaleString()} 원</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">일 평균 정산</Text>
            <Text>{Math.floor(totalIncome / 30).toLocaleString()} 원</Text>
          </Box>
        </Stack>

        <Divider my={6} />

        {/* 회사별 금액 */}
        <VStack align="stretch" spacing={3}>
          <Text fontWeight="bold" mb={2}>
            회사별 금액
          </Text>
          {incomeData.map((item, idx) => (
            <HStack key={idx} justify="space-between" p={3} bg={boxBg} rounded="lg">
              <Box>
                <Text fontWeight="bold">{item.name}</Text>
                <Text fontSize="sm" color="gray.500">
                  {item.amount.toLocaleString()} 원
                </Text>
              </Box>
              <Button size="sm" colorScheme="blue">
                수정
              </Button>
            </HStack>
          ))}
        </VStack>
      </Box>

      {/* 우측 영역 */}
      <Box
        flex="1.5"
        bg={cardBg}
        border="1px solid"
        borderColor={cardBorder}
        p={6}
        rounded="2xl"
        shadow="sm"
      >
        <Heading size="md" mb={4}>
          지출 내역
        </Heading>
        <Text fontSize="lg" fontWeight="bold" color="red.500">
          총 지출금액 {totalExpense.toLocaleString()} 원
        </Text>

        <VStack align="stretch" spacing={2} mb={4}>
          <Input
            placeholder="지출 항목"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <NumberInput
            value={newAmount}
            onChange={(val) => setNewAmount(val)}
          >
            <NumberInputField placeholder="금액 (원)" />
          </NumberInput>
          <Button colorScheme="blue" onClick={handleAddExpense}>
            내역 추가하기
          </Button>
        </VStack>

        <Text fontSize="sm" color="gray.600" mb={4}>
          순이익 {profit.toLocaleString()} 원
        </Text>

        <Divider my={4} />

        <VStack align="stretch" spacing={3}>
          {expenses.map((item, idx) => (
            <HStack key={idx} justify="space-between">
              <Text>{item.name}</Text>
              <Text color="gray.700" fontWeight="bold">
                {item.amount.toLocaleString()} 원
              </Text>
            </HStack>
          ))}
        </VStack>
      </Box>
    </Flex>
  );
}
