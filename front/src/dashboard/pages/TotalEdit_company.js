// src/pages/CompanyPage.js
import React, { useState, useEffect } from "react";
import {
  Box, Flex, Heading, Button, VStack, Input,
  NumberInput, NumberInputField, useColorModeValue,
  useToast, Checkbox, CheckboxGroup, Stack,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, useDisclosure
} from "@chakra-ui/react";
import { ArrowForwardIcon, EditIcon } from "@chakra-ui/icons";
import { income_Data } from "../js/company_api";
import { income_filter_Data } from "../js/company_filter";

export default function CompanyPage() {
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const toast = useToast();

  const [range, setRange] = useState({ from: new Date(), to: new Date() });
  const [tempCompanies, setTempCompanies] = useState([]);
  const [selectedTemp, setSelectedTemp] = useState([]);
  const [finalCompanies, setFinalCompanies] = useState([]);
  const [selectedFinal, setSelectedFinal] = useState([]);

  // 추가 모달
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
  } = useDisclosure();

  const [newCompany, setNewCompany] = useState({
    name: "",
    detail: "",
    amount: "",
    date: new Date(),
  });

  // 수정 모달
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    detail: "",
    amount: "",
    date: new Date(),
  });

  const handleFetch = async (start, end) => {
    const result = await income_filter_Data({ start, end }, toast);
    if (!result?.success || !Array.isArray(result.data)) return;
    const incData = result.data.map((r) => ({
      name: r.company_name,
      detail: r.company_detail || "-",
      amount: r.amount,
      date: new Date(),
    }));
    setTempCompanies(incData);
  };

  useEffect(() => {
    handleFetch(range.from, range.to);
  }, []);

  // ✅ 추가 모달 저장
  const handleAddCompany = () => {
    if (!newCompany.name || !newCompany.amount) {
      toast({
        title: "입력 오류",
        description: "회사명과 금액은 필수입니다",
        status: "warning",
      });
      return;
    }
    setTempCompanies([...tempCompanies, newCompany]);
    setNewCompany({ name: "", detail: "", amount: "", date: new Date() });
    onAddClose();
  };

  // 임시 → 최종
  const handleMoveSelected = () => {
    const toMove = tempCompanies.filter((_, i) =>
      selectedTemp.includes(i.toString())
    );
    const remain = tempCompanies.filter(
      (_, i) => !selectedTemp.includes(i.toString())
    );
    setFinalCompanies([...finalCompanies, ...toMove]);
    setTempCompanies(remain);
    setSelectedTemp([]);
  };

  // 최종 → 임시
  const handleMoveBack = () => {
    const toMove = finalCompanies.filter((_, i) =>
      selectedFinal.includes(i.toString())
    );
    const remain = finalCompanies.filter(
      (_, i) => !selectedFinal.includes(i.toString())
    );
    setTempCompanies([...tempCompanies, ...toMove]);
    setFinalCompanies(remain);
    setSelectedFinal([]);
  };

  // ✅ 최종 저장
  const handleRegisterCompanies = async () => {
    if (selectedFinal.length === 0) {
      toast({ title: "저장할 항목을 선택하세요", status: "warning" });
      return;
    }
    try {
      const toSave = finalCompanies.filter((_, i) =>
        selectedFinal.includes(i.toString())
      );
      for (const item of toSave) {
        const payload = {
          date: item.date.toISOString().split("T")[0],
          company_name: item.name,
          company_detail: item.detail,
          amount: Number(item.amount),
        };
        await income_Data(payload, toast);
      }
      const remain = finalCompanies.filter(
        (_, i) => !selectedFinal.includes(i.toString())
      );
      setFinalCompanies(remain);
      setSelectedFinal([]);
      toast({ title: "저장 완료", status: "success" });
    } catch {
      toast({ title: "서버 오류", status: "error" });
    }
  };

  // 수정 버튼
  const handleEditClick = (idx) => {
    setEditIndex(idx);
    setEditData(tempCompanies[idx]);
    onEditOpen();
  };

  const handleEditSave = () => {
    const updated = [...tempCompanies];
    updated[editIndex] = editData;
    setTempCompanies(updated);
    onEditClose();
  };

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <Flex gap={6} align="flex-start">
        {/* 왼쪽 - 임시 리스트 */}
        <Box
          flex="1"
          bg={cardBg}
          border="1px solid"
          borderColor={cardBorder}
          p={6}
          rounded="2xl"
          shadow="sm"
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="md">임시 리스트</Heading>
            <Button colorScheme="blue" onClick={onAddOpen}>
              + 업체 추가
            </Button>
          </Flex>

          <VStack spacing={3} align="stretch">
            {tempCompanies.length === 0 && (
              <Box color="gray.500">추가된 항목이 없습니다.</Box>
            )}
            <CheckboxGroup value={selectedTemp} onChange={setSelectedTemp}>
              <Stack spacing={2}>
                {tempCompanies.map((item, idx) => (
                  <Flex key={idx} justify="space-between" align="center">
                    <Checkbox value={idx.toString()}>
                      <strong>{item.name}</strong> ({item.amount}원)
                    </Checkbox>
                    <Button
                      size="xs"
                      leftIcon={<EditIcon />}
                      onClick={() => handleEditClick(idx)}
                    >
                      수정
                    </Button>
                  </Flex>
                ))}
              </Stack>
            </CheckboxGroup>
          </VStack>
        </Box>

        {/* 가운데 이동 */}
        <Flex direction="column" align="center" justify="center" gap={4}>
          <Button
            rightIcon={<ArrowForwardIcon />}
            colorScheme="blue"
            onClick={handleMoveSelected}
            isDisabled={selectedTemp.length === 0}
          >
            선택 이동
          </Button>
          <Button
            leftIcon={<ArrowForwardIcon style={{ transform: "rotate(180deg)" }} />}
            colorScheme="orange"
            onClick={handleMoveBack}
            isDisabled={selectedFinal.length === 0}
          >
            선택 이동
          </Button>
        </Flex>

        {/* 오른쪽 - 최종 리스트 */}
        <Box
          flex="1"
          bg={cardBg}
          border="1px solid"
          borderColor={cardBorder}
          p={6}
          rounded="2xl"
          shadow="sm"
        >
          <Heading size="md" mb={4}>
            최종 등록 리스트
          </Heading>
          <VStack spacing={3} align="stretch">
            {finalCompanies.length === 0 && (
              <Box color="gray.500">이동된 항목이 없습니다.</Box>
            )}
            <CheckboxGroup value={selectedFinal} onChange={setSelectedFinal}>
              <Stack spacing={2}>
                {finalCompanies.map((item, idx) => (
                  <Checkbox key={idx} value={idx.toString()}>
                    <strong>{item.name}</strong> ({item.amount}원)
                  </Checkbox>
                ))}
              </Stack>
            </CheckboxGroup>
          </VStack>

          <Button
            mt={6}
            colorScheme="green"
            onClick={handleRegisterCompanies}
            isDisabled={selectedFinal.length === 0}
          >
            선택 저장
          </Button>
        </Box>
      </Flex>

      {/* ✅ 추가 모달 */}
      <Modal isOpen={isAddOpen} onClose={onAddClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>업체 추가</ModalHeader>
          <ModalBody>
            <VStack spacing={3} align="stretch">
              <Input
                type="date"
                value={newCompany.date.toISOString().split("T")[0]}
                onChange={(e) =>
                  setNewCompany({ ...newCompany, date: new Date(e.target.value) })
                }
              />
              <Input
                placeholder="회사명"
                value={newCompany.name}
                onChange={(e) =>
                  setNewCompany({ ...newCompany, name: e.target.value })
                }
              />
              <Input
                placeholder="회사 상세"
                value={newCompany.detail}
                onChange={(e) =>
                  setNewCompany({ ...newCompany, detail: e.target.value })
                }
              />
              <NumberInput
                value={newCompany.amount}
                onChange={(val) =>
                  setNewCompany({ ...newCompany, amount: val })
                }
              >
                <NumberInputField placeholder="금액 (원)" />
              </NumberInput>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleAddCompany}>
              추가
            </Button>
            <Button onClick={onAddClose}>취소</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 수정 모달 */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>항목 수정</ModalHeader>
          <ModalBody>
            <VStack spacing={3} align="stretch">
              <Input
                placeholder="회사명"
                value={editData.name}
                onChange={(e) =>
                  setEditData({ ...editData, name: e.target.value })
                }
              />
              <Input
                placeholder="회사 상세"
                value={editData.detail}
                onChange={(e) =>
                  setEditData({ ...editData, detail: e.target.value })
                }
              />
              <NumberInput
                value={editData.amount}
                onChange={(val) =>
                  setEditData({ ...editData, amount: val })
                }
              >
                <NumberInputField placeholder="금액 (원)" />
              </NumberInput>
              <Input
                type="date"
                value={editData.date.toISOString().split("T")[0]}
                onChange={(e) =>
                  setEditData({ ...editData, date: new Date(e.target.value) })
                }
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleEditSave}>
              저장
            </Button>
            <Button onClick={onEditClose}>취소</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
