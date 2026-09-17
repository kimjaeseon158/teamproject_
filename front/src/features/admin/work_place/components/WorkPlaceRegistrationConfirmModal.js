import { Box, Button, Flex, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text } from "@chakra-ui/react";
import { RATE_FIELDS } from "../constants/rateFields";

export default function WorkPlaceRegistrationConfirmModal({ registration, saving, onClose, onConfirm }) {
  return (
    <Modal isOpen={Boolean(registration)} onClose={onClose} isCentered closeOnOverlayClick={false} closeOnEsc={false} size="sm">
      <ModalOverlay />
      <ModalContent w="90%" maxH="90dvh" borderRadius="xl" overflow="hidden">
        <ModalHeader>근무지 등록 확인</ModalHeader>
        <ModalBody overflowY="auto">
          <Text><Text as="span" fontWeight="bold">{registration?.name}</Text> 근무지를 아래 내용으로 등록할까요?</Text>
          <Box as="dl" mt={4}>
            {RATE_FIELDS.map((field) => <Flex key={field.key} justify="space-between" gap={3} py={2} borderBottomWidth="1px" borderColor="gray.100">
              <Text as="dt" fontSize="sm" color="gray.600">{field.label}</Text>
              <Text as="dd" fontSize="sm" fontWeight="bold">{Number(registration?.place?.[field.key] ?? 0).toLocaleString()}원</Text>
            </Flex>)}
          </Box>
        </ModalBody>
        <ModalFooter gap={2} flexShrink={0}>
          <Button variant="ghost" onClick={onClose} isDisabled={saving}>취소</Button>
          <Button colorScheme="blue" onClick={onConfirm} isLoading={saving} loadingText="등록 중">확인</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
