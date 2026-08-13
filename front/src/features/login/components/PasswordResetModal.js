import { useEffect, useState } from "react";
import {
  Alert, AlertIcon, Button, FormControl, FormLabel, Input, Modal,
  ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader,
  ModalOverlay, Text, useToast,
} from "@chakra-ui/react";
import { requestPasswordReset } from "../api/passwordResetApi";
import { formatResidentNumber } from "../../admin/userList/utils/format";
import { ERROR_MESSAGES, getErrorMessage } from "../../../constants/errorMessages";

export default function PasswordResetModal({ isOpen, onClose, initialUserId, onSubmitted }) {
  const toast = useToast();
  const [userId, setUserId] = useState(initialUserId || "");
  const [residentNumber, setResidentNumber] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUserId(initialUserId || "");
      setResidentNumber("");
      setSubmitted(false);
    }
  }, [initialUserId, isOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!userId.trim() || residentNumber.replace(/\D/g, "").length !== 13) return;
    setLoading(true);
    try {
      const result = await requestPasswordReset({ userId, residentNumber });
      if (!result?.accepted) return;
      toast.closeAll();
      setSubmitted(true);
      onSubmitted?.(userId);
    } catch (error) {
      toast({ title: "요청 전송 실패", description: getErrorMessage(error, ERROR_MESSAGES.passwordReset.requestFailed), status: "error", isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered closeOnOverlayClick={!loading}>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>비밀번호 초기화 요청</ModalHeader>
        <ModalCloseButton isDisabled={loading} />
        <ModalBody>
          {submitted ? (
            <Alert status="success" alignItems="flex-start"><AlertIcon />
              <Text fontSize="sm">{ERROR_MESSAGES.passwordReset.requestAccepted} 요청 접수 여부와 승인 상태는 보안을 위해 이 화면에서 확인할 수 없습니다.</Text>
            </Alert>
          ) : (
            <>
              <Text fontSize="sm" color="gray.600" mb={4}>아이디와 주민등록번호 전체를 입력해 주세요.</Text>
              <FormControl isRequired mb={4}><FormLabel>아이디</FormLabel>
                <Input value={userId} onChange={(e) => setUserId(e.target.value)} autoComplete="username" />
              </FormControl>
              <FormControl isRequired><FormLabel>주민등록번호</FormLabel>
                <Input value={residentNumber} onChange={(e) => setResidentNumber(formatResidentNumber(e.target.value))} placeholder="000000-0000000" inputMode="numeric" />
              </FormControl>
            </>
          )}
        </ModalBody>
        <ModalFooter gap={2}>
          {!submitted && (
            <Button type="submit" colorScheme="blue" isLoading={loading} isDisabled={!userId.trim() || residentNumber.replace(/\D/g, "").length !== 13}>요청하기</Button>
          )}
          <Button onClick={onClose} isDisabled={loading}>닫기</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
