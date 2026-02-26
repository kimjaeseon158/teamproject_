// components/activity/SubmitConfirmDialog.jsx
import {
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
  Stack,
  Box,
  Text,
} from "@chakra-ui/react";

export default function SubmitConfirmDialog({
  isOpen,
  onClose,
  cart,
  onConfirm,
  cancelRef,
}) {
  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader>전체 등록 확인</AlertDialogHeader>
          <AlertDialogBody>
            <Stack spacing={2}>
              {cart.map((c) => (
                <Box key={c.id}>
                  <Text>
                    📅 {c.work_date.year}-{String(c.work_date.month).padStart(2, "0")}-{String(c.work_date.day).padStart(2, "0")}
                  </Text>
                  <Text>🕘 {c.baseShift} · {c.startTime} ~ {c.finishTime}</Text>
                  <Text>📍 {c.location}</Text>
                </Box>
              ))}
            </Stack>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>취소</Button>
            <Button colorScheme="green" ml={3} onClick={onConfirm}>등록</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}
