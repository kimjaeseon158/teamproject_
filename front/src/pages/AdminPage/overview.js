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
  Text,
  Spinner,
} from "@chakra-ui/react";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import CalendarSection from "../../feactures/admin/overview/section/CalendarSection";
import PendingApproveSection from "../../feactures/admin/overview/section/PendingApproveSection";
import useGoogleLinkStatus from "../../feactures/admin/api/google/useGoogleLinkStatus";
import { login as googleLogin } from "../../feactures/admin/api/google/googleAuth";

export default function OverviewPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalEvent, setModalEvent] = useState(null);

  // 🔥 구글 연동 상태 확인
  const { linked, loading: statusLoading } = useGoogleLinkStatus();

  // 🔥 승인 대기 원본 데이터 (건별 리스트)
  const [pendingList, setPendingList] = useState([]);

  // 🔥 시간 포맷 함수 (오전/오후 - HH:mm)
  const formatTimeWithAMPM = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";
    
    const hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "오후" : "오전";
    // 12시간제로 변환 (0시는 12시로 표시)
    const displayHours = String(hours % 12 || 12).padStart(2, "0");
    
    return `${ampm} - ${displayHours}:${minutes}`;
  };
  console.log(setModalEvent)

  return (
    <Box p={6} height="100vh" display="flex" flexDirection="column">
      
      {/* 🔗 구글 연동 상태 및 버튼 */}
      <Flex justify="flex-end" mb={4} align="center">
        {statusLoading ? (
          <Spinner size="sm" color="blue.500" />
        ) : linked ? (
          <Flex align="center" gap={2} px={3} py={1} bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
            <FcGoogle />
            <Text fontSize="sm" color="green.700" fontWeight="bold">구글 연동 완료</Text>
          </Flex>
        ) : (
          <Button
            leftIcon={<FcGoogle />}
            variant="outline"
            size="sm"
            colorScheme="blue"
            onClick={googleLogin}
          >
            구글 계정 연결
          </Button>
        )}
      </Flex>

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
                <Input value={formatTimeWithAMPM(modalEvent.start)} isReadOnly />
              </FormControl>

              <FormControl mb={3}>
                <FormLabel>종료</FormLabel>
                <Input value={formatTimeWithAMPM(modalEvent.end)} isReadOnly />
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