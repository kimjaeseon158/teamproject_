import {
  Badge, Box, Button, FormControl, FormLabel, HStack, Icon, Modal,
  ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
  Select, SimpleGrid, Text, useToast, VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { DownloadIcon } from "@chakra-ui/icons";
import MonthPicker from "../../../common/MonthPicker";
import useAdminWorkPlaceOptions from "../../../common/hooks/useAdminWorkPlaceOptions";

const ALL_WORK_PLACES = "__ALL__";

export default function ExcelExportModal({
  dateMode = "single", initialMonth, isOpen, onClose, onConfirm,
  loading, showWorkPlace = true, title = "엑셀 다운로드",
}) {
  const toast = useToast();
  const today = new Date();
  const [workPlace, setWorkPlace] = useState(ALL_WORK_PLACES);
  const [year, setYear] = useState(today.getFullYear().toString());
  const [month, setMonth] = useState(String(today.getMonth() + 1).padStart(2, "0"));
  const [startMonth, setStartMonth] = useState(initialMonth || `${year}-${month}`);
  const [endMonth, setEndMonth] = useState(initialMonth || `${year}-${month}`);
  const workPlaceOptions = useAdminWorkPlaceOptions(toast, showWorkPlace);

  useEffect(() => {
    if (!isOpen) {
      const resetDate = new Date();
      setWorkPlace(ALL_WORK_PLACES);
      setYear(resetDate.getFullYear().toString());
      setMonth(String(resetDate.getMonth() + 1).padStart(2, "0"));
      return;
    }
    if (dateMode === "range") {
      const currentDate = new Date();
      const value = initialMonth || `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
      setStartMonth(value);
      setEndMonth(value);
    }
  }, [dateMode, initialMonth, isOpen]);

  const handleConfirm = () => {
    if (dateMode === "range") {
      if (!startMonth || !endMonth || startMonth > endMonth) {
        toast({ title: "올바른 기간을 선택해주세요.", status: "warning", duration: 2500, isClosable: true });
        return;
      }
      onConfirm(startMonth, endMonth);
      return;
    }
    const selectedWorkPlace = workPlace === ALL_WORK_PLACES ? "" : workPlace;
    onConfirm(showWorkPlace ? selectedWorkPlace : "", `${year}-${month}`);
  };

  const years = Array.from({ length: 5 }, (_, index) => (today.getFullYear() - index).toString());
  const months = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0"));

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm" closeOnOverlayClick={false} closeOnEsc={false}>
      <ModalOverlay backdropFilter="blur(10px) saturate(180%)" />
      <ModalContent borderRadius="30px" overflow="hidden" boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)" bg="white" mx={4}>
        <ModalHeader p={0}>
          <Box bgGradient="linear(to-r, green.400, teal.500)" px={6} py={8} textAlign="center">
            <Icon as={DownloadIcon} w={10} h={10} color="white" mb={3} />
            <Text color="white" fontSize="xl" fontWeight="900">{title}</Text>
            <Text color="whiteAlpha.800" fontSize="xs" mt={1}>선택한 데이터를 템플릿에 입력해 다운로드합니다.</Text>
          </Box>
        </ModalHeader>
        <ModalBody px={8} py={10}>
          <VStack spacing={8} align="stretch">
            {showWorkPlace && (
              <FormControl>
                <HStack mb={2} justify="space-between">
                  <FormLabel fontSize="xs" fontWeight="900" color="gray.400" m={0}>근무지</FormLabel>
                  <Badge colorScheme="green" variant="subtle" borderRadius="full" px={2}>선택</Badge>
                </HStack>
                <Select value={workPlace} onChange={(event) => setWorkPlace(event.target.value)} h="56px" borderRadius="20px" bg="gray.50" border="none" fontWeight="700" isDisabled={workPlaceOptions.loading}>
                  <option value={ALL_WORK_PLACES}>{workPlaceOptions.loading ? "근무지 불러오는 중..." : "전체"}</option>
                  {workPlaceOptions.workPlaceNames.map((location) => <option key={location} value={location}>{location}</option>)}
                </Select>
              </FormControl>
            )}
            {dateMode === "range" ? (
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="900" color="gray.400" mb={2}>내보낼 기간</FormLabel>
                <SimpleGrid columns={2} spacing={4}>
                  <Box><Text mb={2} fontSize="xs" color="gray.500">시작 월</Text><MonthPicker value={startMonth} onChange={setStartMonth} width="100%" height="56px" borderRadius="20px" placement="bottom-start" shouldFlip={false} /></Box>
                  <Box><Text mb={2} fontSize="xs" color="gray.500">종료 월</Text><MonthPicker value={endMonth} onChange={setEndMonth} width="100%" height="56px" borderRadius="20px" placement="bottom-end" shouldFlip={false} /></Box>
                </SimpleGrid>
              </FormControl>
            ) : (
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="900" color="gray.400" mb={2}>연도 및 월</FormLabel>
                <SimpleGrid columns={2} spacing={4}>
                  <Select value={year} onChange={(event) => setYear(event.target.value)} h="56px" borderRadius="20px" bg="gray.50" border="none" fontWeight="700">{years.map((value) => <option key={value} value={value}>{value}년</option>)}</Select>
                  <Select value={month} onChange={(event) => setMonth(event.target.value)} h="56px" borderRadius="20px" bg="gray.50" border="none" fontWeight="700">{months.map((value) => <option key={value} value={value}>{Number(value)}월</option>)}</Select>
                </SimpleGrid>
              </FormControl>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter p={8} pt={0}>
          <VStack w="100%" spacing={3}>
            <Button colorScheme="green" w="100%" h="60px" borderRadius="20px" fontWeight="900" onClick={handleConfirm} isLoading={loading} loadingText="파일 생성 중...">엑셀 다운로드</Button>
            <Button variant="ghost" color="gray.400" size="sm" onClick={onClose} isDisabled={loading}>취소</Button>
          </VStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
