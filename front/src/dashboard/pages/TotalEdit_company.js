// src/pages/CompanyPage.js
import React, { useState, useEffect } from "react";
import {
  Box, Flex, Heading, Button, VStack, HStack,
  Input, NumberInput, NumberInputField, useColorModeValue,
  useDisclosure, useToast, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalBody, ModalFooter,
  Table, Thead, Tbody, Tr, Th, Td, TableContainer, Stat, StatLabel, StatNumber,
  IconButton
} from "@chakra-ui/react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { income_Data } from "../js/company_api";
import { income_filter_Data } from "../js/company_filter";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { CloseIcon } from "@chakra-ui/icons";

const COLORS = ["#3182CE", "#2ECC71", "#E74C3C", "#F39C12", "#9B59B6"];

export default function CompanyPage() {
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const toast = useToast();

  const { isOpen: isRangeOpen, onOpen: onRangeOpen, onClose: onRangeClose } = useDisclosure();
  const { isOpen: isCompanyOpen, onOpen: onCompanyOpen, onClose: onCompanyClose } = useDisclosure();

  const [range, setRange] = useState({ from: new Date(), to: new Date() });
  const [tempRange, setTempRange] = useState(range);

  const [incomeData, setIncomeData] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);

  // 업체 여러 개 추가용 리스트
  const [companyList, setCompanyList] = useState([
    { name: "", detail: "", amount: "", date: new Date() }
  ]);

  // 기간 필터 GET
  const handleFetch = async (start, end) => {
    const result = await income_filter_Data({ start, end }, toast);
    if (!result || !result.success || !Array.isArray(result.data)) {
      setIncomeData([]);
      setTotalIncome(0);
      return;
    }
    const incData = result.data.map(r => ({
      name: r.company_name,
      detail: r.company_detail || "-",
      amount: r.amount
    }));
    setIncomeData(incData);
    setTotalIncome(incData.reduce((acc, cur) => acc + cur.amount, 0));
  };

  useEffect(() => { handleFetch(range.from, range.to); }, []);

  // 업체 리스트 행 추가/삭제
  const addCompanyRow = () =>
    setCompanyList([...companyList, { name: "", detail: "", amount: "", date: new Date() }]);

  const removeCompanyRow = (index) =>
    setCompanyList(companyList.filter((_, i) => i !== index));

  // 업체 추가 POST
  const handleAddCompany = async () => {
    if (companyList.some(c => !c.name || !c.amount)) {
      toast({
        title: "입력 오류",
        description: "모든 항목에 회사명과 금액을 입력하세요",
        status: "warning"
      });
      return;
    }

    try {
      for (const item of companyList) {
        const payload = {
          date: item.date.toISOString().split("T")[0],
          company_name: item.name,
          company_detail: item.detail,
          amount: Number(item.amount),
        };
        await income_Data(payload, toast);
      }

      await handleFetch(range.from, range.to);
      setCompanyList([{ name: "", detail: "", amount: "", date: new Date() }]);
      onCompanyClose();
      toast({ title: "추가 완료", status: "success" });
    } catch (err) {
      console.error(err);
      toast({
        title: "오류",
        description: "서버와 통신 중 문제가 발생했습니다.",
        status: "error"
      });
    }
  };

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <Flex gap={6}>
        {/* 왼쪽 - 업체 관리 */}
        <Box flex="2" bg={cardBg} border="1px solid" borderColor={cardBorder} p={6} rounded="2xl" shadow="sm">
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="md">업체 계약 금액</Heading>
            <Button size="sm" onClick={onRangeOpen}>
              {range.from.toLocaleDateString()} - {range.to.toLocaleDateString()}
            </Button>
          </Flex>

          <Button colorScheme="green" mb={4} onClick={onCompanyOpen}>업체 추가</Button>

          <TableContainer borderRadius="lg" overflow="hidden" border="1px solid" borderColor="gray.200">
            <Table variant="simple" size="md">
              <Thead bg="gray.100">
                <Tr>
                  <Th>업체명</Th>
                  <Th>상세</Th>
                  <Th isNumeric>금액</Th>
                </Tr>
              </Thead>
              <Tbody>
                {incomeData.map((item, idx) => (
                  <Tr key={idx} _hover={{ bg: "gray.50", cursor: "pointer" }}>
                    <Td>{item.name}</Td>
                    <Td>{item.detail}</Td>
                    <Td isNumeric>{item.amount.toLocaleString()} 원</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>

        {/* 오른쪽 - 도넛 차트 + 총금액 */}
        <Box flex="1" display="flex" flexDirection="column" gap={6}>
          {/* 도넛 차트 */}
          <Box bg={cardBg} p={4} rounded="lg" shadow="sm" flex="1">
            <Heading size="sm" mb={2}>업체 비율 (도넛)</Heading>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={incomeData}
                  dataKey="amount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  label
                >
                  {incomeData.map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>

          {/* 총금액 박스 */}
          <Box bg="gray.100" p={6} rounded="lg" shadow="sm">
            <Stat>
              <StatLabel>총 계약 금액</StatLabel>
              <StatNumber color="blue.600">{totalIncome.toLocaleString()} 원</StatNumber>
            </Stat>
          </Box>
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

      {/* 업체 추가 모달 */}
      <Modal isOpen={isCompanyOpen} onClose={onCompanyClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>업체 추가</ModalHeader>
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {companyList.map((item, idx) => (
                <Box key={idx} p={3} bg={cardBg} border="1px solid" borderColor={cardBorder} rounded="lg">
                  <HStack spacing={2} mb={2}>
                    <Input
                      type="date"
                      value={item.date.toISOString().split("T")[0]}
                      onChange={(e) => {
                        const newList = [...companyList];
                        newList[idx].date = new Date(e.target.value);
                        setCompanyList(newList);
                      }}
                    />
                    <IconButton
                      aria-label="삭제"
                      icon={<CloseIcon />}
                      size="sm"
                      colorScheme="red"
                      onClick={() => removeCompanyRow(idx)}
                    />
                  </HStack>
                  <Input
                    placeholder="회사명"
                    value={item.name}
                    mb={2}
                    onChange={(e) => {
                      const newList = [...companyList];
                      newList[idx].name = e.target.value;
                      setCompanyList(newList);
                    }}
                  />
                  <Input
                    placeholder="회사 상세"
                    value={item.detail}
                    mb={2}
                    onChange={(e) => {
                      const newList = [...companyList];
                      newList[idx].detail = e.target.value;
                      setCompanyList(newList);
                    }}
                  />
                  <NumberInput
                    value={item.amount}
                    onChange={(val) => {
                      const newList = [...companyList];
                      newList[idx].amount = val;
                      setCompanyList(newList);
                    }}
                  >
                    <NumberInputField placeholder="금액 (원)" />
                  </NumberInput>
                </Box>
              ))}
              <Button colorScheme="blue" variant="outline" onClick={addCompanyRow}>
                + 업체 항목 추가
              </Button>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" mr={3} onClick={handleAddCompany}>추가</Button>
            <Button onClick={onCompanyClose}>취소</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
