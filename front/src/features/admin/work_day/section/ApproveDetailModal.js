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

const InfoCard = ({ title, children }) => (
  <Box border="1px solid" borderColor="gray.300" borderRadius="12px" p={4} mb={3}>
    <Text fontSize="sm" fontWeight="bold" mb={2}>
      {title}
    </Text>
    {children}
  </Box>
);

const EXTRA_WORK_COLOR_SCHEMES = {
  weekday_ot: "orange",
  holiday_special: "red",
  holiday_ot: "orange",
  night_ot: "purple",
  early_arrival: "purple",
  lunch_ext: "yellow",
};

const WorkTimeRow = ({ title, time, tag, duration, colorScheme = "blue" }) => (
  <Flex align="center" justify="space-between" gap={2} p={3} minH="54px">
    <Text fontSize="sm" color="gray.900" fontWeight="700" minW="64px">
      {title}
    </Text>
    <Text flex="1" textAlign="center">
      {time || "-"}
    </Text>
    <Tag colorScheme={colorScheme} w="88px" justifyContent="center">
      {tag}
    </Tag>
    <Text fontWeight="bold" minW="48px" textAlign="right">
      {duration}
    </Text>
  </Flex>
);

export default function ApproveDetailModal({
  employee,
  isOpen,
  onClose,
  onApprove,
  onReject,
  saving,
}) {
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (isOpen) {
      setRejectReason("");
    }
  }, [employee?.id, isOpen]);

  if (!employee) return null;

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
            <WorkTimeRow
              title="기본근무"
              time={employee.workTime}
              tag={employee.workType}
              duration={employee.dayHM}
            />
            {(employee.extraWorkDetails || []).map((detail) => (
              <Box key={detail.type} mt={1}>
                <WorkTimeRow
                  title="추가근무"
                  time={detail.time}
                  tag={detail.label}
                  duration={detail.duration}
                  colorScheme={EXTRA_WORK_COLOR_SCHEMES[detail.type] || "orange"}
                />
              </Box>
            ))}
            <Box mt={3}>
              <Text fontSize="sm" color="blue.600" fontWeight="semibold">
                총 시간: {employee.totalWorkHM || employee.dayHM}
              </Text>
            </Box>
          </InfoCard>

          <InfoCard title="반려 사유">
            <Textarea
              placeholder="반려 사유를 입력하세요."
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
            onClick={() => onApprove(employee)}
          >
            승인
          </Button>

          <Button
            colorScheme="red"
            mr={2}
            isLoading={saving}
            onClick={() => onReject(employee, rejectReason)}
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
