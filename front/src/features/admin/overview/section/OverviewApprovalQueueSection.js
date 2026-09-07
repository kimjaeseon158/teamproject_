import { Box, Flex, Tag, Text, VStack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import DetailButton from "../components/DetailButton";

import DashboardCard from "../components/DashboardCard";
import SectionHeader from "../components/SectionHeader";

export default function OverviewApprovalQueueSection({
  summary,
  pendingPreview,
  onNavigateApproval,
  onRemove,
}) {
  return (
    <DashboardCard p={3} overflow="hidden" display="flex" flexDirection="column">
      <SectionHeader
        title="승인 대기"
        onRemove={onRemove}
        action={<DetailButton onClick={onNavigateApproval} />}
      />
      <Tag size="sm" colorScheme="orange" alignSelf="flex-start" mb={3}>
        대기 {summary.total}건
      </Tag>
      <Text fontSize="xs" color="gray.500" mb={2}>
        승인·반려는 승인 관리에서 진행합니다.
      </Text>
      <VStack align="stretch" spacing={2} minH={0} flex="1" overflowY="auto">
        {pendingPreview.length > 0 ? (
          pendingPreview.map((item, index) => (
            <Flex
              as={RouterLink}
              key={`${item.user_uuid}-${item.work_date}-${index}`}
              to={`/dashboard/approval?${new URLSearchParams({
                date: String(item.work_date || "").slice(0, 10),
                workday: String(item.id ?? ""),
                user: String(item.user_uuid || ""),
                shift: item.work_shift || "",
                place: item.work_place || "",
              })}`}
              aria-label={`${item.user_name} ${item.work_date} 근무 상세`}
              align="center"
              p={2}
              bg="gray.50"
              borderRadius="md"
              flexShrink={0}
              cursor="pointer"
              textDecoration="none"
              transition="background-color 0.15s"
              _hover={{ bg: "blue.50", textDecoration: "none" }}
              _focusVisible={{ outline: "2px solid", outlineColor: "blue.500", outlineOffset: "-2px" }}
            >
              <Box minW={0}>
                <Text fontWeight="900" color="gray.800" fontSize="sm" noOfLines={1}>
                  {item.user_name}
                </Text>
                <Text fontSize="xs" color="gray.500" noOfLines={1}>
                  {item.work_place || "근무지 미지정"} · {item.work_shift || "근무"}
                </Text>
              </Box>
            </Flex>
          ))
        ) : (
          <Text fontSize="sm" color="gray.500">승인 대기 내역이 없습니다.</Text>
        )}
      </VStack>
    </DashboardCard>
  );
}
