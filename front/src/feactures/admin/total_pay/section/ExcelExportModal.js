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
  Input,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import locationsList from "../../../common/work_placeCloums/locationsList";

export default function ExcelExportModal({ isOpen, onClose, onConfirm, loading }) {
  const [workPlace, setWorkPlace] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleConfirm = () => {
    if (!workPlace || !date) {
      alert("근무지와 날짜를 모두 선택해주세요.");
      return;
    }
    onConfirm(workPlace, date);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>엑셀 파일 생성 (Google Drive)</ModalHeader>
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>근무지 선택</FormLabel>
              <Select
                placeholder="근무지를 선택하세요"
                value={workPlace}
                onChange={(e) => setWorkPlace(e.target.value)}
              >
                {locationsList.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>기준 날짜 선택</FormLabel>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter gap={3}>
          <Button
            colorScheme="green"
            onClick={handleConfirm}
            isLoading={loading}
          >
            확인 및 업로드
          </Button>
          <Button variant="ghost" onClick={onClose} isDisabled={loading}>
            취소
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
