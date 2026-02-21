import { useState } from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, Button, Text, Box, Tag, Flex, Textarea
} from "@chakra-ui/react";
import { adminWorkdayStatusUpdate } from "../api/adminWorkdayStatusUpdate";

const InfoCard = ({ title, children }) => (
  <Box border="1px solid" borderColor="gray.300" borderRadius="12px" p={4} mb={3}>
    <Text fontSize="sm" fontWeight="bold" mb={2}>{title}</Text>
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

  if (!employee) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
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
            <Flex justify="space-between">
              <Text>{employee.workTime}</Text>
              <Tag>{employee.workType}</Tag>
              <Text fontWeight="bold">{employee.dayHM}</Text>
            </Flex>
          </InfoCard>

          <InfoCard title="거절 사유">
            <Textarea
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
            onClick={async () => {
              setSaving(true);
              await adminWorkdayStatusUpdate(
                {
                  user_uuid: employee.user_uuid,
                  work_date: employee.date,
                  work_shift: employee.workType,
                  status: "Y",
                },
                { toast }
              );
              setSaving(false);
              onClose();
              refresh();
            }}
          >
            승인
          </Button>

          <Button onClick={onClose}>닫기</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
