import { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Box,
  Tag,
  Flex,
  Textarea,
} from "@chakra-ui/react";
import { adminWorkdayStatusUpdate } from "../api/adminWorkdayStatusUpdate";

const InfoCard = ({ title, children }) => (
  <Box
    border="1px solid"
    borderColor="gray.300"
    borderRadius="12px"
    p={4}
    mb={3}
  >
    <Text fontSize="sm" fontWeight="bold" mb={2}>
      {title}
    </Text>
    {children}
  </Box>
);

export default function ApproveDetailModal({
  employee,
  isOpen,
  onClose,
  toast,
  refresh,
}) {
  const [rejectReason, setRejectReason] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRejectReason("");
    }
  }, [employee?.id, isOpen]);

  if (!employee) return null;

  /* ======================
     승인 처리
  ====================== */
  const handleApprove = async () => {
    try {
      setSaving(true);

      await adminWorkdayStatusUpdate(
        {
          user_uuid: employee.user_uuid,
          work_date: employee.date,
          work_shift: employee.workShift || employee.workType,
          status: true,
        },
        { toast }
      );

      toast({
        title: "승인 완료",
        status: "success",
      });

      onClose();
      refresh();
    } catch (err) {
      toast({
        title: "승인 중 오류 발생",
        description: err.message,
        status: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  /* ======================
     반려 처리
  ====================== */
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast({
        title: "반려 사유를 입력하세요.",
        status: "warning",
      });
      return;
    }

    try {
      setSaving(true);

      await adminWorkdayStatusUpdate(
        {
          user_uuid: employee.user_uuid,
          work_date: employee.date,
          work_shift: employee.workShift || employee.workType,
          status: false,
          reject_reason: rejectReason,
        },
        { toast }
      );

      toast({
        title: "반려 완료",
        status: "info",
      });

      onClose();
      refresh();
    } catch (err) {
      toast({
        title: "반려 중 오류 발생",
        description: err.message,
        status: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>근무 상세 정보</ModalHeader>

        <ModalBody>

          <InfoCard title="근무 요약">
            <Flex justify="space-between">
              <Text>{employee.name}</Text>
              <Text>{employee.date}</Text>
              <Text>{employee.location}</Text>
            </Flex>
          </InfoCard>

          <InfoCard title="근무 시간">
            <Flex justify="space-between" align="center">
              <Text fontSize="sm" color="gray.500" minW="72px">
                근무시간
              </Text>
              <Text>{employee.workTime}</Text>
              <Tag>{employee.workType}</Tag>
              <Text fontWeight="bold">{employee.dayHM}</Text>
            </Flex>
            {employee.overtimeChecked && (
              <Flex justify="space-between" align="center" mt={2}>
                <Text fontSize="sm" color="gray.500" minW="72px">
                  잔업시간
                </Text>
                <Text>{employee.overtimeTime || "-"}</Text>
                <Tag colorScheme="orange">잔업</Tag>
                <Text fontWeight="bold">{employee.overtimeDuration}</Text>
              </Flex>
            )}
            <Box mt={3}>
              <Text fontSize="sm" color="blue.600" fontWeight="semibold">
                총 시간: {employee.totalWorkHM || employee.dayHM}
              </Text>
            </Box>
          </InfoCard>

          <InfoCard title="반려 사유">
            <Textarea
              placeholder="반려 사유를 입력하세요"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </InfoCard>

        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme="green"
            mr={2}
            isLoading={saving}
            onClick={handleApprove}
          >
            승인
          </Button>

          <Button
            colorScheme="red"
            mr={2}
            isLoading={saving}
            onClick={handleReject}
          >
            반려
          </Button>

          <Button onClick={onClose} isDisabled={saving}>
            닫기
          </Button>
        </ModalFooter>

      </ModalContent>
    </Modal>
  );
}
