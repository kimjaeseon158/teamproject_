import { Box, Flex, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, FormControl, FormLabel, useDisclosure } from "@chakra-ui/react";
import { useState } from "react";
import CalendarSection from "../sections/CalendarSection";
import FinanceSection from "../sections/FinanceSection";
import PendingApproveSection from "../sections/PendingApproveSection";

export default function OverviewPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [modalEvent, setModalEvent] = useState(null);

  return (
    <Box p={6} height="100vh" display="flex" flexDirection="column">
      <CalendarSection
        onSelectEvent={(event) => {
          setModalEvent(event);
          onOpen();
        }}
      />

      <Flex flex="1" gap={4} border="1px solid #ddd" borderRadius="8px" overflow="hidden">
        <FinanceSection />
        <PendingApproveSection list={[]} />
      </Flex>

      {/* 일정 상세 모달 (읽기 전용) */}
      {modalEvent && (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>일정 정보</ModalHeader>
            <ModalBody>
              <FormControl mb={3}>
                <FormLabel>제목</FormLabel>
                <Input value={modalEvent.title} isReadOnly />
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>시작</FormLabel>
                <Input value={modalEvent.start} isReadOnly />
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>종료</FormLabel>
                <Input value={modalEvent.end} isReadOnly />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button onClick={onClose}>닫기</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
}
