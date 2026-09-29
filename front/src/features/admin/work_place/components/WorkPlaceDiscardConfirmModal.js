import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react";
import { useRef } from "react";

export default function WorkPlaceDiscardConfirmModal({ isOpen, onCancel, onConfirm }) {
  const cancelRef = useRef(null);

  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onCancel} isCentered>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader>변경사항을 취소할까요?</AlertDialogHeader>
          <AlertDialogBody>
            저장하지 않은 내용이 있습니다. 변경사항을 취소하면 입력한 내용은 복구할 수 없습니다.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onCancel}>계속 작성</Button>
            <Button colorScheme="red" ml={3} onClick={onConfirm}>변경사항 취소</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}
