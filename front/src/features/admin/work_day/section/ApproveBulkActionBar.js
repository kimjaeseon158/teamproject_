import {
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  useDisclosure,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";

import { isApprovedStatus, isRejectedStatus } from "../utils/approveUtils";

const ACTION_META = {
  approve: {
    title: "선택 승인",
    confirmText: "승인하기",
    colorScheme: "green",
    status: true,
    successTitle: "선택 승인 완료",
  },
  reject: {
    title: "선택 반려",
    confirmText: "반려하기",
    colorScheme: "red",
    status: false,
    successTitle: "선택 반려 완료",
  },
};

export default function ApproveBulkActionBar({
  selectedRows,
  toast,
  clearSelection,
  isDisabled,
  onBulkUpdate,
  saving,
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [actionType, setActionType] = useState("approve");
  const [rejectReason, setRejectReason] = useState("");

  const action = ACTION_META[actionType];
  const isReject = actionType === "reject";

  const selectedCount = selectedRows.length;
  const targetRows = useMemo(
    () =>
      selectedRows.filter((row) =>
        isReject ? !isRejectedStatus(row.status) : !isApprovedStatus(row.status)
      ),
    [isReject, selectedRows]
  );
  const excludedRows = useMemo(
    () =>
      selectedRows.filter((row) =>
        isReject ? isRejectedStatus(row.status) : isApprovedStatus(row.status)
      ),
    [isReject, selectedRows]
  );
  const pendingTargetCount = targetRows.filter((row) => row.status === "대기").length;
  const approvedTargetCount = targetRows.filter((row) => isApprovedStatus(row.status)).length;
  const rejectedTargetCount = targetRows.filter((row) => isRejectedStatus(row.status)).length;
  const selectedNames = useMemo(
    () => targetRows.map((row) => row.name).filter(Boolean).slice(0, 3).join(", "),
    [targetRows]
  );

  const openConfirm = (nextActionType) => {
    if (!selectedCount) {
      toast({
        title: "선택된 내역이 없습니다.",
        description: "처리할 항목을 먼저 선택해주세요.",
        status: "warning",
        duration: 2500,
      });
      return;
    }

    const nextTargetRows = selectedRows.filter((row) =>
      nextActionType === "reject"
        ? !isRejectedStatus(row.status)
        : !isApprovedStatus(row.status)
    );

    if (!nextTargetRows.length) {
      toast({
        title: "처리할 항목이 없습니다.",
        description:
          nextActionType === "reject"
            ? "이미 반려된 항목은 제외됩니다."
            : "이미 승인된 항목은 제외됩니다.",
        status: "warning",
        duration: 2500,
      });
      return;
    }

    setActionType(nextActionType);
    setRejectReason("");
    onOpen();
  };

  const handleConfirm = async () => {
    if (isReject && !rejectReason.trim()) {
      toast({
        title: "반려 사유를 입력해주세요.",
        status: "warning",
        duration: 2500,
      });
      return;
    }

    const success = await onBulkUpdate({
      rows: targetRows,
      status: action.status,
      rejectReason: rejectReason.trim(),
      successTitle: action.successTitle,
    });

    if (success) {
      clearSelection();
      onClose();
    }
  };

  return (
    <>
      <HStack spacing={2}>
        <Text fontSize="sm" color="gray.500" fontWeight="700">
          선택 {selectedCount.toLocaleString()}건
        </Text>
        <Button
          size="sm"
          colorScheme="green"
          variant="outline"
          onClick={() => openConfirm("approve")}
          isDisabled={isDisabled}
        >
          선택 승인
        </Button>
        <Button
          size="sm"
          colorScheme="red"
          variant="outline"
          onClick={() => openConfirm("reject")}
          isDisabled={isDisabled}
        >
          선택 반려
        </Button>
      </HStack>

      <Modal isOpen={isOpen} onClose={saving ? undefined : onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{action.title}</ModalHeader>
          <ModalCloseButton isDisabled={saving} />
          <ModalBody>
            <Text fontSize="sm" color="gray.700">
              선택한 {selectedCount.toLocaleString()}건 중 {targetRows.length.toLocaleString()}건을{" "}
              {isReject ? "반려" : "승인"}하시겠습니까?
            </Text>
            <Text mt={3} fontSize="sm" color="gray.600">
              대기 중 {isReject ? "반려" : "승인"}: {pendingTargetCount.toLocaleString()}건
            </Text>
            {isReject ? (
              <Text fontSize="sm" color="gray.600">
                승인 후 반려: {approvedTargetCount.toLocaleString()}건
              </Text>
            ) : (
              <Text fontSize="sm" color="gray.600">
                반려 후 승인: {rejectedTargetCount.toLocaleString()}건
              </Text>
            )}
            {!!excludedRows.length && (
              <Text fontSize="sm" color="gray.500">
                기존 {isReject ? "반려" : "승인"}: {excludedRows.length.toLocaleString()}건 제외
              </Text>
            )}
            {selectedNames && (
              <Text mt={2} fontSize="xs" color="gray.500">
                대상: {selectedNames}
                {targetRows.length > 3 ? ` 외 ${targetRows.length - 3}건` : ""}
              </Text>
            )}
            {isReject && (
              <Textarea
                mt={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="반려 사유를 입력해주세요."
                isDisabled={saving}
              />
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} isDisabled={saving}>
              취소
            </Button>
            <Button
              colorScheme={action.colorScheme}
              onClick={handleConfirm}
              isLoading={saving}
            >
              {action.confirmText}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
