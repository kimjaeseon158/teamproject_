import {
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, Button, VStack, Input, NumberInput, NumberInputField
} from "@chakra-ui/react";
import { useState } from "react";

export default function CompanyAddModal({ isOpen, onClose, onSave }) {
  const [input, setInput] = useState({
    name: "",
    detail: "",
    amount: "",
    date: new Date(),
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>업체 추가</ModalHeader>
        <ModalBody>
          <VStack spacing={3}>
            <Input
              placeholder="업체명"
              value={input.name}
              onChange={(e) => setInput({ ...input, name: e.target.value })}
            />
            <Input
              placeholder="상세"
              value={input.detail}
              onChange={(e) => setInput({ ...input, detail: e.target.value })}
            />
            <NumberInput
              value={input.amount}
              onChange={(v) => setInput({ ...input, amount: v })}
            >
              <NumberInputField placeholder="금액" />
            </NumberInput>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="green"
            onClick={() => {
              onSave([input]);
              onClose();
            }}
          >
            저장
          </Button>
          <Button ml={2} onClick={onClose}>취소</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
