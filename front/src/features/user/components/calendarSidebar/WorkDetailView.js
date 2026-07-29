import { Badge, Box, Button, Divider, HStack, Text, VStack } from "@chakra-ui/react";
import { InfoIcon } from "@chakra-ui/icons";

import Option from "../option";
import {
  formatWon,
  getApprovalStatus,
  getBaseAmount,
  getOvertimeAmount,
  getWorkType,
} from "../../utils/calendarSidebarUtils";

const TEXT = {
  addWork: "\ucd94\uac00\u0020\uadfc\ubb34\u0020\ub4f1\ub85d",
  disabledEdit: "\uc218\uc815\ubd88\uac00",
  edit: "\uc218\uc815",
  nthWork: "\ubc88\uc9f8\u0020\uadfc\ubb34",
  overtime: "\uc794\uc5c5/\uc5f0\uc7a5",
  rejectionReason: "\ubc18\ub824\u0020\uc0ac\uc720",
  totalAmount: "\ucd1d\u0020\uae08\uc561",
  totalDateAmount: "\uc120\ud0dd\u0020\ub0a0\uc9dc\u0020\ucd1d\u0020\uae08\uc561",
  wageTotal: "\uc77c\uae09\u0020\ud569\uacc4",
  workCount: "\uac74\u0020\uadfc\ubb34",
  workInfo: "\uadfc\ubb34\uc9c0\u0020\uc815\ubcf4",
  workPlaceMissing: "\uadfc\ubb34\uc9c0\u0020\ubbf8\uc9c0\uc815",
};

const EditAction = ({ canEdit, onEdit }) =>
  canEdit ? (
    <Button size="sm" colorScheme="blue" onClick={onEdit}>
      {TEXT.edit}
    </Button>
  ) : (
    <Box
      as="span"
      minW="72px"
      px={3}
      py={2}
      border="1px solid"
      borderColor="whiteAlpha.300"
      borderRadius="8px"
      color="gray.300"
      fontSize="sm"
      fontWeight="800"
      textAlign="center"
      flexShrink={0}
    >
      {TEXT.disabledEdit}
    </Box>
  );

export default function WorkDetailView({
  event,
  isMobile,
  onClose,
  onEditWork,
  onRefresh,
  selectedDate,
}) {
  const data = event.extendedProps;
  const groupedItems = data.grouped_items?.length ? data.grouped_items : [data];
  const canAddMore = groupedItems.length < 2;
  const totalAmount =
    data.calendar_amount ??
    groupedItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const status = getApprovalStatus(data.is_approved);

  if (groupedItems.length > 1) {
    return (
      <VStack align="stretch" spacing={4} py={2} color="white">
        <HStack justify="space-between" align="center">
          <Badge colorScheme={status.color} p="2px 12px" borderRadius="full" fontSize="xs">
            {status.text}
          </Badge>
          <Badge colorScheme="blue" borderRadius="full" px={3}>
            {groupedItems.length}{TEXT.workCount}
          </Badge>
        </HStack>

        <Box>
          <Text fontSize="xs" color="gray.500" fontWeight="700" mb={1}>
            {TEXT.totalDateAmount}
          </Text>
          <Text fontSize="2xl" fontWeight="900" color="blue.300">
            {formatWon(totalAmount)}
          </Text>
        </Box>

        <Divider borderColor="whiteAlpha.200" />

        <VStack align="stretch" spacing={3}>
          {groupedItems.map((item, index) => {
            const workType = getWorkType(item);
            const overtimeAmount = getOvertimeAmount(item);
            const baseAmount = getBaseAmount(item);
            const itemStatus = getApprovalStatus(item.is_approved);

            return (
              <Box
                key={`${item.date}-${item.work_place}-${index}`}
                bg="whiteAlpha.100"
                border="1px solid"
                borderColor="whiteAlpha.200"
                borderRadius="20px"
                p={4}
              >
                <HStack justify="space-between" align="start" mb={2} spacing={3}>
                  <HStack minW={0} wrap="wrap">
                    <Badge colorScheme="purple" borderRadius="full">
                      {index + 1}{TEXT.nthWork}
                    </Badge>
                    <Badge colorScheme={itemStatus.color} borderRadius="full">
                      {itemStatus.text}
                    </Badge>
                  </HStack>
                  <EditAction
                    canEdit={item.is_approved === null}
                    onEdit={() => onEditWork?.(item)}
                  />
                </HStack>

                <Text fontSize="lg" fontWeight="900" mb={2}>
                  {item.work_place || TEXT.workPlaceMissing}
                </Text>

                <VStack align="stretch" spacing={1} fontSize="sm" color="gray.200">
                  <HStack justify="space-between">
                    <Text>{workType}</Text>
                    <Text fontWeight="800">{formatWon(baseAmount)}</Text>
                  </HStack>
                  {overtimeAmount > 0 && (
                    <HStack justify="space-between">
                      <Text>{TEXT.overtime}</Text>
                      <Text fontWeight="800">{formatWon(overtimeAmount)}</Text>
                    </HStack>
                  )}
                  <Divider borderColor="whiteAlpha.200" />
                  <HStack justify="space-between" color="blue.200">
                    <Text fontWeight="800">{TEXT.totalAmount}</Text>
                    <Text fontWeight="900">{formatWon(item.amount)}</Text>
                  </HStack>
                </VStack>
              </Box>
            );
          })}
        </VStack>
      </VStack>
    );
  }

  return (
    <VStack align="stretch" spacing={5} py={2} color="white">
      <HStack justify="space-between" align="start" spacing={3}>
        <HStack minW={0} wrap="wrap">
          <Badge colorScheme={status.color} p="2px 12px" borderRadius="full" fontSize="xs">
            {status.text}
          </Badge>
          <Text fontSize="sm" color="gray.400" fontWeight="600">
            {data.work_type || data.work_shift}
          </Text>
        </HStack>
        <EditAction
          canEdit={data.is_approved === null}
          onEdit={() => onEditWork?.(data)}
        />
      </HStack>

      <Box>
        <Text fontSize="xs" color="gray.500" fontWeight="700" mb={1}>
          {TEXT.workInfo}
        </Text>
        <Text fontSize="2xl" fontWeight="900" letterSpacing="0">
          {data.work_place || TEXT.workPlaceMissing}
        </Text>
      </Box>

      <Divider borderColor="whiteAlpha.200" />

      <Box>
        <Text fontSize="xs" color="gray.500" fontWeight="700" mb={1}>
          {TEXT.wageTotal}
        </Text>
        <Text fontSize="2xl" fontWeight="900" color="blue.300">
          {formatWon(data.amount)}
        </Text>
      </Box>

      {data.is_approved === false && (data.rejection_reason || data.reject_reason) && (
        <Box bg="rgba(116, 42, 42, 0.2)" p={4} borderRadius="24px" border="1px solid" borderColor="red.900">
          <HStack mb={1}>
            <InfoIcon w={3} h={3} color="red.300" />
            <Text fontSize="xs" fontWeight="800" color="red.300">
              {TEXT.rejectionReason}
            </Text>
          </HStack>
          <Text fontSize="sm" color="gray.200">
            {data.rejection_reason || data.reject_reason}
          </Text>
        </Box>
      )}

      {canAddMore && (
        <>
          <Divider borderColor="whiteAlpha.200" />
          <Box>
            <Text fontSize="xs" color="gray.500" fontWeight="800" mb={3}>
              {TEXT.addWork}
            </Text>
            <Option
              selectedDate={selectedDate}
              onRefresh={onRefresh}
              onClose={onClose}
              isMobile={isMobile}
            />
          </Box>
        </>
      )}
    </VStack>
  );
}
