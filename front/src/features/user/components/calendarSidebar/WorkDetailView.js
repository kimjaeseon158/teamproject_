import { Badge, Box, Divider, HStack, Text, VStack } from "@chakra-ui/react";
import { InfoIcon } from "@chakra-ui/icons";

import Option from "../option";
import {
  formatWon,
  getApprovalStatus,
  getBaseAmount,
  getOvertimeAmount,
  getWorkType,
} from "../../utils/calendarSidebarUtils";

export default function WorkDetailView({
  event,
  isMobile,
  onClose,
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
            {groupedItems.length}건 근무
          </Badge>
        </HStack>

        <Box>
          <Text fontSize="xs" color="gray.500" fontWeight="700" mb={1}>
            선택 날짜 총 금액
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

            return (
              <Box
                key={`${item.date}-${item.work_place}-${index}`}
                bg="whiteAlpha.100"
                border="1px solid"
                borderColor="whiteAlpha.200"
                borderRadius="20px"
                p={4}
              >
                <HStack justify="space-between" mb={2}>
                  <Badge colorScheme="purple" borderRadius="full">
                    {index + 1}번째 근무
                  </Badge>
                  <Text fontSize="xs" color="gray.400" fontWeight="700">
                    {workType}
                  </Text>
                </HStack>

                <Text fontSize="lg" fontWeight="900" mb={2}>
                  {item.work_place}
                </Text>

                <VStack align="stretch" spacing={1} fontSize="sm" color="gray.200">
                  <HStack justify="space-between">
                    <Text>{workType}</Text>
                    <Text fontWeight="800">{formatWon(baseAmount)}</Text>
                  </HStack>
                  {overtimeAmount > 0 && (
                    <HStack justify="space-between">
                      <Text>연장</Text>
                      <Text fontWeight="800">{formatWon(overtimeAmount)}</Text>
                    </HStack>
                  )}
                  <Divider borderColor="whiteAlpha.200" />
                  <HStack justify="space-between" color="blue.200">
                    <Text fontWeight="800">총금액</Text>
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
      <HStack justify="space-between" align="center">
        <Badge colorScheme={status.color} p="2px 12px" borderRadius="full" fontSize="xs">
          {status.text}
        </Badge>
        <Text fontSize="sm" color="gray.400" fontWeight="600">
          {data.work_type || data.work_shift}
        </Text>
      </HStack>

      <Box>
        <Text fontSize="xs" color="gray.500" fontWeight="700" mb={1}>
          근무지 정보
        </Text>
        <Text fontSize="2xl" fontWeight="900" letterSpacing="0">
          {data.work_place}
        </Text>
      </Box>

      <Divider borderColor="whiteAlpha.200" />

      <Box>
        <Text fontSize="xs" color="gray.500" fontWeight="700" mb={1}>
          일급 합계
        </Text>
        <Text fontSize="2xl" fontWeight="900" color="blue.300">
          {formatWon(data.amount)}
        </Text>
      </Box>

      {data.is_approved === false && data.rejection_reason && (
        <Box bg="rgba(116, 42, 42, 0.2)" p={4} borderRadius="24px" border="1px solid" borderColor="red.900">
          <HStack mb={1}>
            <InfoIcon w={3} h={3} color="red.300" />
            <Text fontSize="xs" fontWeight="800" color="red.300">
              반려 사유
            </Text>
          </HStack>
          <Text fontSize="sm" color="gray.200">
            {data.rejection_reason}
          </Text>
        </Box>
      )}

      {canAddMore && (
        <>
          <Divider borderColor="whiteAlpha.200" />
          <Box>
            <Text fontSize="xs" color="gray.500" fontWeight="800" mb={3}>
              추가 근무 등록
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
