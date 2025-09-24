// src/pages/CompanyPage.js
import React, { useState, useEffect } from "react";
import {
  Box, Flex, Heading, Text, Button, Divider, VStack, HStack,
  Input, NumberInput, NumberInputField, useColorModeValue,
  useDisclosure, useToast, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalBody, ModalFooter
} from "@chakra-ui/react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { income_Data } from "../js/company_api";
import { income_filter_Data } from "../js/company_filter";

export default function CompanyPage() {
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const boxBg = useColorModeValue("gray.100", "gray.700");
  const toast = useToast();

  const { isOpen: isRangeOpen, onOpen: onRangeOpen, onClose: onRangeClose } = useDisclosure();
  const { isOpen: isCompanyOpen, onOpen: onCompanyOpen, onClose: onCompanyClose } = useDisclosure();

  const [range, setRange] = useState({ from: new Date(), to: new Date() });
  const [tempRange, setTempRange] = useState(range);

  const [incomeData, setIncomeData] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);

  const [companyName, setCompanyName] = useState("");
  const [companyDetail, setCompanyDetail] = useState("");
  const [companyAmount, setCompanyAmount] = useState("");
  const [companyDate, setCompanyDate] = useState(new Date());

  // 기간 필터 GET 호출
  const handleFetch = async (start, end) => {
    const result = await income_filter_Data({ start, end }, toast);
    if (!result || !result.success || !Array.isArray(result.data)) {
      setIncomeData([]);
      setTotalIncome(0);
      return;
    }
    const incData = result.data.map(r => ({ name: r.company_name, amount: r.amount }));
    setIncomeData(incData);
    setTotalIncome(incData.reduce((acc, cur) => acc + cur.amount, 0));
  };


  useEffect(() => { handleFetch(range.from, range.to); }, []);

  // 업체 추가 POST
  const handleAddCompany = async () => {
    if (!companyName || !companyAmount) {
      toast({ title: "입력 오류", description: "회사명과 금액을 입력하세요", status: "warning" });
      return;
    }
    const payload = {
      date: companyDate.toISOString().split("T")[0],
      company_name: companyName,
      company_detail: companyDetail,
      amount: Number(companyAmount),
    };
    const result = await income_Data(payload, toast); // POST
    if (result) {
      const updated = [...incomeData, { name: companyName, amount: Number(companyAmount) }];
      setIncomeData(updated);
      setTotalIncome(updated.reduce((acc, cur) => acc + cur.amount, 0));
      setCompanyName(""); setCompanyDetail(""); setCompanyAmount("");
      onCompanyClose();
    }
  };

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <Box bg={cardBg} border="1px solid" borderColor={cardBorder} p={6} rounded="2xl" shadow="sm">
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md">업체 계약 금액</Heading>
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
                  handleFetch(tempRange.from, tempRange.to); // GET으로 필터
                  onRangeClose();
                }
              }}>적용</Button>
              <Button onClick={onRangeClose}>취소</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Text fontSize="2xl" fontWeight="bold" color="blue.600" mb={4}>
          {totalIncome.toLocaleString()} 원
        </Text>
        <Divider my={4} />

        <Button colorScheme="green" mb={4} onClick={onCompanyOpen}>업체 추가</Button>

        {/* 업체 추가 모달 */}
        <Modal isOpen={isCompanyOpen} onClose={onCompanyClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>업체 추가</ModalHeader>
            <ModalBody>
              <VStack spacing={3}>
                <Input type="date" value={companyDate.toISOString().split("T")[0]} onChange={(e) => setCompanyDate(new Date(e.target.value))} />
                <Input placeholder="회사명" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                <Input placeholder="회사 상세" value={companyDetail} onChange={(e) => setCompanyDetail(e.target.value)} />
                <NumberInput value={companyAmount} onChange={(val) => setCompanyAmount(val)}>
                  <NumberInputField placeholder="금액 (원)" />
                </NumberInput>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="green" onClick={handleAddCompany}>추가</Button>
              <Button onClick={onCompanyClose}>취소</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <VStack align="stretch" spacing={3}>
          {incomeData.map((item, idx) => (
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
