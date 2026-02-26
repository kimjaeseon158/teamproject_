import { Box, Flex, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, FormControl, FormLabel, useDisclosure } from "@chakra-ui/react";
import { useState } from "react";
import CalendarSection from "../../feactures/admin/overview/section/CalendarSection";
import FinanceSection from "../../feactures/admin/total_pay/section/FinanceSection";
import PendingApproveSection from "../../feactures/admin/overview/section/PendingApproveSection";

export default function OverviewPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [modalEvent, setModalEvent] = useState(null);

  return (
    <Box p={6} height="100vh" display="flex" flexDirection="column">
      <Flex  p={3} height="100vh">
        <Box flex="2">
          <CalendarSection
            onSelectEvent={(event) => {
              setModalEvent(event);
              onOpen();
            }}
          />
        </Box>

        <Box
          flex="1"
          border="1px solid #ddd"
          borderRadius="8px"
          display="flex"
          flexDirection="column"
          overflow="hidden"
        >
          <PendingApproveSection  h="100%"  list={[]} />
        </Box>
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
