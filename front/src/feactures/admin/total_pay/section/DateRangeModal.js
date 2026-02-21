import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@chakra-ui/react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function DateRangeModal({
  isOpen,
  onClose,
  range,
  setRange,
  onApply,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>날짜 선택</ModalHeader>
        <ModalBody>
          <DayPicker
            mode="range"
            selected={range}
            onSelect={(r) =>
              setRange(r || { from: null, to: null })
            }
          />
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onApply}>
            적용
          </Button>
          <Button onClick={onClose}>취소</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
