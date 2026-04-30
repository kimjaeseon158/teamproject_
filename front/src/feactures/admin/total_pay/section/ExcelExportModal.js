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
  Text,
} from "@chakra-ui/react";
import { useState } from "react";

export default function ExcelExportModal({ isOpen, onClose, onConfirm, loading }) {
  // ⚠️ 경로 문제를 방지하기 위해 데이터를 내부에 직접 선언
  const LOCATIONS = [
    "삼성전자(평택)", "삼성전자(기흥)", "삼성전자(아산)", 
    "삼성전자(서울)", "삼성디스플레이(온양)"
  ];
  
  const today = new Date();
  const [workPlace, setWorkPlace] = useState("");
  const [date, setDate] = useState(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  });

  const handleConfirm = () => {
    if (!workPlace || !date) {
      alert("근무지와 날짜를 모두 선택해주세요.");
      return;
    }
    onConfirm(workPlace, date);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay backdropFilter="blur(2px)" />
      <ModalContent>
        <ModalHeader borderBottom="1px solid #eee">엑셀 파일 생성</ModalHeader>
        
        <ModalBody py={6}>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>근무지 선택</FormLabel>
              <Select
                placeholder="근무지를 선택하세요"
                value={workPlace}
                onChange={(e) => setWorkPlace(e.target.value)}
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>기준 월 선택</FormLabel>
              <input
                type="month"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  width: "100%",
                  height: "40px",
                  padding: "0 12px",
                  borderRadius: "6px",
                  border: "1px solid #E2E8F0",
                  fontSize: "16px"
                }}
              />
            </FormControl>
            <Text fontSize="xs" color="gray.500">
              * 선택한 월의 전체 데이터를 엑셀로 추출합니다.
            </Text>
          </VStack>
        </ModalBody>

        <ModalFooter bg="gray.50">
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={loading}>
            취소
          </Button>
          <Button colorScheme="blue" onClick={handleConfirm} isLoading={loading}>
            파일 생성 및 업로드
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
