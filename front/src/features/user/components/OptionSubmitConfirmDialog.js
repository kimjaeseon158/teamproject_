import {
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Badge,
  Box,
  Button,
  HStack,
  IconButton,
  Text,
  VStack,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";

import { getExtraWorkTypeByLabel } from "../../common/workTypes";
import { minutesToHM } from "../utils/timeUtils";

export default function OptionSubmitConfirmDialog({
  isOpen,
  cancelRef,
  cart,
  onClose,
  onDelete,
  onConfirm,
}) {
  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
      <AlertDialogOverlay backdropFilter="blur(4px)">
        <AlertDialogContent bg="#1c1c1e" color="white" borderRadius="24px" m={4}>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            최종 등록 확인
          </AlertDialogHeader>
          <AlertDialogBody>
            <VStack spacing={3} align="stretch" maxH="300px" overflowY="auto" py={2}>
              {cart.map((item) => {
                const extraDetails = item.details.slice(1);

                return (
                  <Box key={item.id} bg="whiteAlpha.100" p={3} borderRadius="16px">
                    <HStack justify="space-between">
                      <HStack spacing={2}>
                        <Text fontWeight="bold">{item.work_date.month}/{item.work_date.day}</Text>
                        <Badge colorScheme={item.baseWorkType?.includes("특근") ? "orange" : "blue"}>
                          {item.baseWorkType || item.baseShift}
                        </Badge>
                        <Badge colorScheme={extraDetails.length > 0 ? "orange" : "gray"}>
                          {extraDetails.length > 0 ? `잔업 ${extraDetails.length}건` : "잔업 없음"}
                        </Badge>
                      </HStack>
                      <IconButton
                        icon={<DeleteIcon />}
                        size="xs"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => onDelete(item.id)}
                        aria-label="항목 삭제"
                      />
                    </HStack>
                    <Text fontSize="sm" color="gray.400">
                      {item.startTime} ~ {item.finishTime} | {item.location}
                    </Text>

                    {extraDetails.length > 0 && (
                      <VStack align="stretch" spacing={1} mt={2}>
                        {extraDetails.map((detail, detailIndex) => (
                          <HStack key={`${item.id}-${detailIndex}`} justify="space-between" fontSize="xs" color="orange.200">
                            <Text>
                              {getExtraWorkTypeByLabel(detail.work_type)?.label || detail.work_type}
                            </Text>
                            <Text fontWeight="bold">{minutesToHM(detail.minutes)}</Text>
                          </HStack>
                        ))}
                      </VStack>
                    )}
                  </Box>
                );
              })}
            </VStack>
          </AlertDialogBody>
          <AlertDialogFooter gap={3}>
            <Button ref={cancelRef} variant="ghost" onClick={onClose}>
              취소
            </Button>
            <Button colorScheme="green" borderRadius="xl" onClick={onConfirm}>
              지금 등록하기
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}
