import {
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, Button, VStack, Input, NumberInput, NumberInputField
} from "@chakra-ui/react";

export default function CompanyEditModal({ isOpen, onClose, data, onSave }) {
  if (!data) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>항목 수정</ModalHeader>
        <ModalBody>
          <VStack spacing={3}>
            <Input value={data.name} isReadOnly />
            <Input value={data.detail} />
            <NumberInput value={data.amount}>
              <NumberInputField />
            </NumberInput>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={() => onSave(data)}>저장</Button>
          <Button ml={2} onClick={onClose}>취소</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
