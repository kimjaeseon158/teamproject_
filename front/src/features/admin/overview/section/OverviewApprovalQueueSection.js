import { Box, Button, Flex, HStack, IconButton, Tag, Text, VStack } from "@chakra-ui/react";
import { CheckIcon, CloseIcon, ExternalLinkIcon } from "@chakra-ui/icons";

import DashboardCard from "../components/DashboardCard";
import SectionHeader from "../components/SectionHeader";

export default function OverviewApprovalQueueSection({
  summary,
  pendingPreview,
  onNavigateApproval,
  onRemove,
}) {
  return (
    <DashboardCard p={3} overflow="hidden">
      <SectionHeader
        title="승인 대기"
        onRemove={onRemove}
        action={
          <Button size="xs" rightIcon={<ExternalLinkIcon />} variant="outline" onClick={onNavigateApproval}>
            전체
          </Button>
        }
      />
      <HStack spacing={2} mb={3} wrap="wrap">
        <Tag size="sm" colorScheme="orange">대기 {summary.total}</Tag>
        <Tag size="sm" colorScheme="blue">주간 {summary.day}</Tag>
        <Tag size="sm" colorScheme="purple">야간 {summary.night}</Tag>
        <Tag size="sm" colorScheme="red">특근 {summary.special}</Tag>
      </HStack>
      <VStack align="stretch" spacing={2} maxH="calc(100% - 72px)" overflowY="auto">
        {pendingPreview.length > 0 ? (
          pendingPreview.map((item, index) => (
            <Flex key={`${item.user_uuid}-${item.work_date}-${index}`} justify="space-between" align="center" gap={2} p={2} bg="gray.50" borderRadius="md">
              <Box minW={0}>
                <Text fontWeight="900" color="gray.800" fontSize="sm" noOfLines={1}>
                  {item.user_name}
                </Text>
                <Text fontSize="xs" color="gray.500" noOfLines={1}>
                  {item.work_place || "근무지 미지정"} · {item.work_shift || "근무"}
                </Text>
              </Box>
              <HStack spacing={1}>
                <IconButton aria-label="승인" icon={<CheckIcon />} size="xs" colorScheme="green" variant="ghost" onClick={onNavigateApproval} />
                <IconButton aria-label="반려" icon={<CloseIcon />} size="xs" colorScheme="red" variant="ghost" onClick={onNavigateApproval} />
              </HStack>
            </Flex>
          ))
        ) : (
          <Text fontSize="sm" color="gray.500">승인 대기 내역이 없습니다.</Text>
        )}
      </VStack>
    </DashboardCard>
  );
}
