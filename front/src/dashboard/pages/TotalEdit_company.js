// src/pages/CompanyPage.js
import React, { useState, useEffect } from "react";
import {
  Box, Flex, Heading, Button, VStack,
  Input, NumberInput, NumberInputField, useColorModeValue,
  useToast, Checkbox, CheckboxGroup, Stack,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Table, Thead, Tbody, Tr, Th, Td, TableContainer,
  Card, CardBody, Stat, StatLabel, StatNumber, Image,
  useDisclosure
} from "@chakra-ui/react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { IconButton } from "@chakra-ui/react";
import { AiOutlineFileExcel } from "react-icons/ai";
import excelLogo from "../img/excel.png"; 
import { income_Data } from "../js/company_api";
import { income_filter_Data } from "../js/company_filter";

const COLORS = ["#2ECC71", "#3182CE", "#9B59B6", "#F39C12", "#E74C3C"];

// YYYY.MM.DD 형식 헬퍼
const z = (n) => String(n).padStart(2, "0");
const fmt = (d) => `${d.getFullYear()}.${z(d.getMonth() + 1)}.${z(d.getDate())}`;

export default function CompanyPage() {
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const toast = useToast();

  const { isOpen: isRangeOpen, onOpen: onRangeOpen, onClose: onRangeClose } = useDisclosure();
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

  const [range, setRange] = useState({ from: undefined, to: undefined });
  const [incomeData, setIncomeData] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);

  // 입력 → 보류(temp) → 최종(final) → 저장
  const [companyInput, setCompanyInput] = useState({ name: "", detail: "", amount: "", date: new Date() });
  const [tempList, setTempList] = useState([]);
  const [selectedTemp, setSelectedTemp] = useState([]);
  const [finalList, setFinalList] = useState([]);
  const [selectedFinal, setSelectedFinal] = useState([]);

  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({ name: "", detail: "", amount: "", date: new Date() });

  // ===========================
  // 서버 데이터 fetch (기간 필터)
  // ===========================
  useEffect(() => {
    const fetchData = async () => {
      if (!range.from || !range.to) return;
      const result = await income_filter_Data({ start: range.from, end: range.to }, toast);
      if (!result || !result.data) {
        setIncomeData([]);
        setTotalIncome(0);
        return;
      }
      const incData = result.data.map(r => ({
        name: r.company_name,
        detail: r.company_detail,
        amount: r.amount,
        date: new Date(r.date),
      }));
      setIncomeData(incData);
      setTotalIncome(incData.reduce((acc, cur) => acc + Number(cur.amount || 0), 0));
    };
    fetchData();
  }, [range, toast]);

  // ===========================
  // 임시 → 최종 이동 및 저장
  // ===========================
  const handleAddTemp = () => {
    if (!companyInput.name || !companyInput.amount) {
      toast({ title: "입력 오류", description: "업체명과 금액은 필수입니다", status: "warning" });
      return;
    }
    setTempList([...tempList, companyInput]);
    setCompanyInput({ name: "", detail: "", amount: "", date: new Date() });
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
          company_name: item.name,
          company_detail: item.detail,
          amount: Number(item.amount),
        };
        await income_Data(payload, toast);
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

  // 테이블에서 체크박스로 최종리스트 담기
  const handleRowSelect = (idx, checked) => {
    if (checked) {
      setFinalList([...finalList, incomeData[idx]]);
    } else {
      setFinalList(finalList.filter(f => f !== incomeData[idx]));
    }
  };

  // 행 클릭 → 수정 모달
  const handleRowClick = (idx) => {
    setEditIndex(idx);
    setEditData(incomeData[idx]);
    onEditOpen();
  };

  // 수정 저장(로컬 상태만)
  const handleEditSave = () => {
    const updated = [...incomeData];
    updated[editIndex] = editData;
    setIncomeData(updated);
    onEditClose();
  };

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <Flex gap={6} flexWrap="wrap">
        {/* 왼쪽 - 테이블 */}
        <Box flex="2" minW="400px" bg={cardBg} border="1px solid" borderColor={cardBorder} p={6} rounded="2xl" shadow="sm">
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="md">업체별 매출</Heading>

            {/* 날짜 범위 버튼 — 선택 시 YYYY.MM.DD ~ YYYY.MM.DD 표시 */}
            <Button size="sm" onClick={onRangeOpen} variant="outline" colorScheme="blue">
              {range.from && range.to ? `${fmt(range.from)} ~ ${fmt(range.to)}` : "기간 선택"}
            </Button>
          </Flex>

          {/* 업체 추가 + 엑셀 시트 연결 버튼 나란히 (엑셀 버튼은 보여주기용) */}
          <Flex gap={2} mb={4}>
            <Button colorScheme="green" onClick={onAddOpen}>
              업체 추가
            </Button>

            <IconButton
              aria-label="엑셀 시트 연결"
              icon={
                <Image
                  src= {excelLogo}    // ✅ public/img/excel.png 기준 경로
                  alt="엑셀 아이콘"
                  boxSize="40px"           // 이미지 크기
                  objectFit="contain"
                />
              }
              colorScheme="green"
              variant="outline"
              size="sm"
              h="40px"
              w="40px"
              borderRadius="md"
              onClick={() =>
                toast({ title: "엑셀 기능 준비 중", status: "info" })
              }
            />
          </Flex>
                    <TableContainer borderRadius="lg" overflow="hidden" border="1px solid" borderColor="gray.200">
            <Table variant="simple" size="md">
              <Thead bg="gray.100">
                <Tr>
                  <Th>선택</Th>
                  <Th>날짜</Th>
                  <Th>업체</Th>
                  <Th>상세</Th>
                  <Th isNumeric>금액</Th>
                </Tr>
              </Thead>
              <Tbody>
                {incomeData.map((item, idx) => (
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
                    <Td isNumeric>{Number(item.amount).toLocaleString()} 원</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>

        {/* 오른쪽 - 차트 & 합계 */}
        <Box flex="1" display="flex" flexDirection="column" gap={6} minW="300px">
          <Card shadow="sm" rounded="2xl" p={4} flex="1">
            <CardBody>
              <Heading size="sm" mb={4}>매출 비율 (도넛)</Heading>
              <Box w="100%" h="250px">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={incomeData} dataKey="amount" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} label>
                      {incomeData.map((_, idx) => (
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
                <StatLabel>총 매출 금액</StatLabel>
                <StatNumber color="green.500">{totalIncome.toLocaleString()} 원</StatNumber>
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
          업체 추가 모달 (보류→최종)
      =========================== */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} size="6xl" isCentered>
        <ModalOverlay />
        <ModalContent w={{ base: "95%", md: "90%", lg: "85%" }} h={{ base: "95vh", md: "90vh", lg: "85vh" }} overflowY="auto" borderRadius="2xl" p={4}>
          <ModalHeader fontSize="xl" fontWeight="bold">업체 추가</ModalHeader>
          <ModalBody>
            <Flex gap={4} minH="400px" align="stretch">
              {/* 왼쪽 - 입력 + 보류 리스트 */}
              <Box flex="1" minW="300px" maxH="70vh" overflowY="auto">
                <VStack spacing={3} align="stretch">
                  <Input
                    type="date"
                    value={companyInput.date.toISOString().split("T")[0]}
                    onChange={(e) => setCompanyInput({ ...companyInput, date: new Date(e.target.value) })}
                  />
                  <Input
                    placeholder="업체명"
                    value={companyInput.name}
                    onChange={(e) => setCompanyInput({ ...companyInput, name: e.target.value })}
                  />
                  <Input
                    placeholder="상세 내용"
                    value={companyInput.detail}
                    onChange={(e) => setCompanyInput({ ...companyInput, detail: e.target.value })}
                  />
                  <NumberInput
                    value={companyInput.amount}
                    onChange={(val) => setCompanyInput({ ...companyInput, amount: val })}
                  >
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

              {/* 중앙 이동 버튼 */}
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
              <Input
                placeholder="업체명"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              />
              <Input
                placeholder="상세 내용"
                value={editData.detail}
                onChange={(e) => setEditData({ ...editData, detail: e.target.value })}
              />
              <NumberInput
                value={editData.amount}
                onChange={(val) => setEditData({ ...editData, amount: val })}
              >
                <NumberInputField placeholder="금액 (원)" />
              </NumberInput>
              <Input
                type="date"
                value={editData.date.toISOString().split("T")[0]}
                onChange={(e) => setEditData({ ...editData, date: new Date(e.target.value) })}
              />
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
