import { Badge, HStack, Text, VStack } from "@chakra-ui/react";

import { getApprovalStatus, getWorkType } from "../../utils/calendarSidebarUtils";

export default function DesktopWorkSummary({ event }) {
  const data = event.extendedProps;
  const groupedItems = data.grouped_items?.length ? data.grouped_items : [data];
  const status = getApprovalStatus(data.is_approved);

  return (
    <VStack align="stretch" spacing={2} mt={4}>
      <Text fontSize="xs" color="gray.500" fontWeight="800">
        이미 등록된 근무
      </Text>
      {groupedItems.map((item, index) => {
        const workType = getWorkType(item);

        return (
          <HStack
            key={`${item.date}-${item.work_place}-${index}`}
            justify="space-between"
            bg="whiteAlpha.100"
            border="1px solid"
            borderColor="whiteAlpha.200"
            borderRadius="16px"
            px={3}
            py={2}
          >
            <Text fontSize="sm" fontWeight="800" noOfLines={1}>
              {workType} · {item.work_place || "근무지 미지정"}
            </Text>
            <Badge colorScheme={status.color} borderRadius="full" flexShrink={0}>
              {status.text}
            </Badge>
          </HStack>
        );
      })}
    </VStack>
  );
}
