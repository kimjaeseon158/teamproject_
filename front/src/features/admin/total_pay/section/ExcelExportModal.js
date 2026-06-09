import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Select,
  VStack,
  HStack,
  Text,
  Icon,
  Box,
  SimpleGrid,
  Badge,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { DownloadIcon } from "@chakra-ui/icons";
// 경로 재검증: section -> total_pay -> admin -> features -> common
import locationsList from "../../../common/work_placeColumns/locationsList";

export default function ExcelExportModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  showWorkPlace = true,
}) {
  const today = new Date();
  const [workPlace, setWorkPlace] = useState("");
  const [year, setYear] = useState(today.getFullYear().toString());
  const [month, setMonth] = useState(String(today.getMonth() + 1).padStart(2, "0"));

  useEffect(() => {
    if (!isOpen) {
      const resetDate = new Date();
      setWorkPlace("");
      setYear(resetDate.getFullYear().toString());
      setMonth(String(resetDate.getMonth() + 1).padStart(2, "0"));
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (!year || !month) {
      alert("근무지와 날짜를 모두 선택해주세요.");
      return;
    }
    onConfirm(showWorkPlace ? workPlace : "", `${year}-${month}`);
  };

  const years = Array.from({ length: 5 }, (_, i) => (today.getFullYear() - i).toString());
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
      <ModalOverlay backdropFilter="blur(10px) saturate(180%)" />
      <ModalContent 
        borderRadius="30px" 
        overflow="hidden" 
        boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)" 
        bg="white"
        mx={4}
      >
        <ModalHeader p={0}>
          <Box bgGradient="linear(to-r, green.400, teal.500)" px={6} py={8} textAlign="center">
            <Icon as={DownloadIcon} w={10} h={10} color="white" mb={3} />
            <Text color="white" fontSize="xl" fontWeight="900" letterSpacing="-0.5px">EXCEL EXPORT</Text>
            <Text color="whiteAlpha.800" fontSize="xs" mt={1}>구글 드라이브로 엑셀 파일을 업로드합니다</Text>
          </Box>
        </ModalHeader>

        <ModalBody px={8} py={10}>
          <VStack spacing={8} align="stretch">
            {/* 근무지 선택 */}
            {showWorkPlace && (
            <FormControl>
              <HStack mb={2} justify="space-between">
                <FormLabel fontSize="xs" fontWeight="900" color="gray.400" m={0} textTransform="uppercase">근무지</FormLabel>
                {workPlace && <Badge colorScheme="green" variant="subtle" borderRadius="full" px={2}>Selected</Badge>}
              </HStack>
              <Select
                placeholder="근무지를 선택해주세요"
                value={workPlace}
                onChange={(e) => setWorkPlace(e.target.value)}
                h="56px"
                borderRadius="20px"
                bg="gray.50"
                border="none"
                fontWeight="700"
                fontSize="md"
                cursor="pointer"
                _focus={{ bg: "white", boxShadow: "0 0 0 2px #48BB78" }}
              >
                <option value="">전체</option>
                {locationsList.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </Select>
            </FormControl>
            )}

            {/* 날짜 선택 */}
            <FormControl>
              <FormLabel fontSize="xs" fontWeight="900" color="gray.400" mb={2} ml={1} textTransform="uppercase">년 & 월 선택</FormLabel>
              <SimpleGrid columns={2} spacing={4}>
                <Select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  h="56px"
                  borderRadius="20px"
                  bg="gray.50"
                  border="none"
                  fontWeight="700"
                  cursor="pointer"
                  _focus={{ bg: "white", boxShadow: "0 0 0 2px #48BB78" }}
                >
                  {years.map(y => <option key={y} value={y}>{y}년</option>)}
                </Select>
                <Select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  h="56px"
                  borderRadius="20px"
                  bg="gray.50"
                  border="none"
                  fontWeight="700"
                  cursor="pointer"
                  _focus={{ bg: "white", boxShadow: "0 0 0 2px #48BB78" }}
                >
                  {months.map(m => <option key={m} value={m}>{parseInt(m)}월</option>)}
                </Select>
              </SimpleGrid>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter p={8} pt={0}>
          <VStack w="100%" spacing={3}>
            <Button
              colorScheme="green"
              w="100%"
              h="60px"
              borderRadius="20px"
              fontSize="md"
              fontWeight="900"
              onClick={handleConfirm}
              isLoading={loading}
              loadingText="업로드 중..."
              boxShadow="0 10px 15px -3px rgba(72, 187, 120, 0.4)"
              _hover={{ transform: "translateY(-2px)", boxShadow: "0 20px 25px -5px rgba(72, 187, 120, 0.4)" }}
              _active={{ transform: "translateY(0)" }}
            >
              업로드 시작하기
            </Button>
            <Button variant="ghost" color="gray.400" size="sm" onClick={onClose} isDisabled={loading} _hover={{ color: "gray.600" }}>
              나중에 하기
            </Button>
          </VStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
