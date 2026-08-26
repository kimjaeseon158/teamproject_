import {
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, Button, VStack, Input, NumberInput, NumberInputField
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

export default function CompanyEditModal({ isOpen, onClose, data, onSave }) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(data ? { ...data } : null);
  }, [data]);

  if (!form) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered closeOnOverlayClick={false} closeOnEsc={false}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>항목 수정</ModalHeader>
        <ModalBody>
          <VStack spacing={3}>
            <Input
              type="date"
              value={form.date.toISOString().split("T")[0]}
              onChange={(e) => setForm({ ...form, date: new Date(`${e.target.value}T00:00:00`) })}
            />
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} />
            <NumberInput value={form.amount} onChange={(value) => setForm({ ...form, amount: value })}>
              <NumberInputField />
            </NumberInput>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            isLoading={saving}
            onClick={async () => {
              try {
                setSaving(true);
                await onSave(form);
                onClose();
              } finally {
                setSaving(false);
              }
            }}
          >
            저장
          </Button>
          <Button ml={2} onClick={onClose} isDisabled={saving}>취소</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
