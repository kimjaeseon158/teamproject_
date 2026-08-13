import { useCallback, useEffect, useState } from "react";
import {
  AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter,
  AlertDialogHeader, AlertDialogOverlay, Box, Button, Center, Spinner,
  Table, Tbody, Td, Text, Th, Thead, Tr, useDisclosure, useToast,
} from "@chakra-ui/react";
import { approvePasswordResetRequest, getPasswordResetRequests } from "../api/passwordResetRequests";
import { ERROR_MESSAGES, getErrorMessage } from "../../../../constants/errorMessages";

const formatRequestedAt = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("ko-KR");
};

export default function PasswordResetRequestSection({ onCountChange }) {
  const toast = useToast();
  const disclosure = useDisclosure();
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPasswordResetRequests({ toast });
      const rows = Array.isArray(data?.requests)
        ? data.requests.filter((request) => request.status === "PENDING")
        : [];
      setRequests(rows);
      onCountChange?.(rows.length);
    } catch (error) {
      toast({ title: "초기화 요청 조회 실패", description: getErrorMessage(error, ERROR_MESSAGES.passwordReset.listFailed), status: "error", isClosable: true });
    } finally {
      setLoading(false);
    }
  }, [onCountChange, toast]);

  useEffect(() => { load(); }, [load]);

  const openApproval = (request) => {
    setSelected(request);
    disclosure.onOpen();
  };

  const approve = async () => {
    if (!selected?.request_uuid) return;
    setApproving(selected.request_uuid);
    try {
      await approvePasswordResetRequest(selected.request_uuid, { toast });
      disclosure.onClose();
      setSelected(null);
      await load();
      toast({ title: "비밀번호 초기화 완료", description: `${selected.user_name}님의 비밀번호를 초기화했습니다.`, status: "success", isClosable: true });
    } catch (error) {
      const title = error.status === 409 ? ERROR_MESSAGES.passwordReset.alreadyProcessed : error.status === 404 ? ERROR_MESSAGES.passwordReset.notFound : ERROR_MESSAGES.passwordReset.approveFailed;
      toast({ title, description: getErrorMessage(error, title), status: "error", isClosable: true });
      if (error.status === 409 || error.status === 404) await load();
      disclosure.onClose();
    } finally {
      setApproving(null);
    }
  };

  if (loading) return <Center minH="280px"><Spinner color="blue.500" /></Center>;
  if (!requests.length) return <Center minH="280px" bg="white" borderWidth="1px" borderRadius="lg"><Box textAlign="center"><Text fontWeight="bold">대기 중인 초기화 요청이 없습니다.</Text><Text fontSize="sm" color="gray.500" mt={2}>새 요청이 접수되면 이곳에서 확인할 수 있습니다.</Text></Box></Center>;

  return (
    <Box bg="white" borderWidth="1px" borderRadius="lg" overflowX="auto">
      <Table><Thead bg="gray.50"><Tr><Th>이름</Th><Th>아이디</Th><Th>요청 시각</Th><Th>상태</Th><Th textAlign="right">관리</Th></Tr></Thead>
        <Tbody>{requests.map((request) => (
          <Tr key={request.request_uuid}><Td fontWeight="bold">{request.user_name}</Td><Td>{request.user_id}</Td><Td>{formatRequestedAt(request.requested_at)}</Td><Td>대기</Td><Td textAlign="right"><Button size="sm" colorScheme="blue" onClick={() => openApproval(request)} isDisabled={!!approving}>승인</Button></Td></Tr>
        ))}</Tbody>
      </Table>
      <AlertDialog isOpen={disclosure.isOpen} onClose={disclosure.onClose} isCentered>
        <AlertDialogOverlay><AlertDialogContent><AlertDialogHeader>비밀번호 초기화 승인</AlertDialogHeader><AlertDialogBody>
          <Text><strong>{selected?.user_name}</strong>님의 비밀번호가 생년월일 6자리로 초기화되고 기존 로그인 세션이 종료됩니다.</Text>
        </AlertDialogBody><AlertDialogFooter><Button onClick={disclosure.onClose} isDisabled={!!approving}>취소</Button><Button ml={3} colorScheme="blue" onClick={approve} isLoading={approving === selected?.request_uuid}>승인</Button></AlertDialogFooter></AlertDialogContent></AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
