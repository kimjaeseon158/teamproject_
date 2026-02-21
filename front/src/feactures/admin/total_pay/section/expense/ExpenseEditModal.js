import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  Input,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";

export default function ExpenseEditModal({ isOpen, onClose, data, onSave }) {
  const [form, setForm] = useState(null);

  useEffect(() => {
    setForm(data);
  }, [data]);

  if (!form) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>지출 수정</ModalHeader>
        <ModalBody>
          <VStack spacing={3}>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              value={form.detail}
              onChange={(e) => setForm({ ...form, detail: e.target.value })}
            />
            <NumberInput
              value={form.amount}
              onChange={(v) => setForm({ ...form, amount: v })}
            >
              <NumberInputField />
            </NumberInput>
            <Input
              type="date"
              value={form.date.toISOString().split("T")[0]}
              onChange={(e) =>
                setForm({ ...form, date: new Date(e.target.value) })
              }
            />
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            onClick={() => {
              onSave(form);
              onClose();
            }}
          >
            저장
          </Button>
          <Button ml={2} onClick={onClose}>
            취소
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
