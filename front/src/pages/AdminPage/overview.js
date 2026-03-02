import {
  Box,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  FormControl,
  FormLabel,
  useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";
import CalendarSection from "../../feactures/admin/overview/section/CalendarSection";
import PendingApproveSection from "../../feactures/admin/overview/section/PendingApproveSection";

export default function OverviewPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalEvent, setModalEvent] = useState(null);

  // 🔥 승인 대기 원본 데이터 (건별 리스트)
  const [pendingList, setPendingList] = useState([]);

  return (
    <Box p={6} height="100vh" display="flex" flexDirection="column">
      <Flex flex="1" gap={4} overflow="hidden">
        
        {/* 📅 왼쪽 캘린더 */}
        <Box flex="2" minW="0">
          <CalendarSection
            onUpdatePendingList={setPendingList} // 🔥 여기서 월 변경 시 리스트 업데이트
            onSelectEvent={(event) => {
              setModalEvent(event);
              onOpen();
            }}
          />
        </Box>

        {/* 📊 오른쪽 승인 대기 요약 */}
        <Box flex="1" minW="300px">
          <PendingApproveSection workDays={pendingList} />
        </Box>
      </Flex>

      {/* 📌 일정 상세 모달 */}
      {modalEvent && (
        <Modal
          isOpen={isOpen}
          onClose={() => {
            setModalEvent(null);
            onClose();
          }}
          isCentered
        >
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
              <Button
                onClick={() => {
                  setModalEvent(null);
                  onClose();
                }}
              >
                닫기
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
}