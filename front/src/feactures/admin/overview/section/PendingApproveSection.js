import {
  Box,
  Button,
  Flex,
  Tag,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import useApproveSummary from "../hook/useApproveSummary";

export default function PendingApproveSection({ workDays = [] }) {
  const navigate = useNavigate();
  const summary = useApproveSummary(workDays);

  return (
    <Box
      flex="1"
      bg="gray.50"
      p={4}
      borderLeft="1px solid #eee"
      overflowY="auto"
    >
      {/* 상단 헤더 */}
      <Flex justify="space-between" align="center" mb={3}>
        <Text fontWeight="bold">
          승인 대기중 ({summary.total}건)
        </Text>

        <Button
          size="sm"
          onClick={() => navigate("/dashboard/approval")}
        >
          상세보기
        </Button>
      </Flex>

      {/* 주간 / 야간 / 특근 집계 */}
      <Flex gap={2} mb={4} wrap="wrap">
        <Tag colorScheme="blue">주간 {summary.day}</Tag>
        <Tag colorScheme="purple">야간 {summary.night}</Tag>
        <Tag colorScheme="orange">특근 {summary.special}</Tag>
      </Flex>

      {/* 사용자별 요약 */}
      <VStack align="stretch" spacing={3}>
        {summary.users.length > 0 ? (
          summary.users.map((user) => (
            <Flex
              key={user.user_uuid}
              justify="space-between"
              align="center"
              p={3}
              borderRadius="8px"
              bg="white"
              boxShadow="sm"
              _hover={{ bg: "gray.100" }}
              cursor="pointer"
              onClick={() =>
                navigate(
                  `/dashboard/approval?user_uuid=${user.user_uuid}`
                )
              }
            >
              <Text fontWeight="600">{user.user_name}</Text>

              <Tag size="sm" colorScheme="yellow">
                {user.count}건
              </Tag>
            </Flex>
          ))
        ) : (
          <Text fontSize="sm" color="gray.500">
            대기중인 승인 내역이 없습니다.
          </Text>
        )}
      </VStack>
    </Box>
  );
}