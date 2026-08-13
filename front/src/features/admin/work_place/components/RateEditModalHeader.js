import { Avatar, Badge, Box, Flex, HStack, ModalCloseButton, SimpleGrid, Text } from "@chakra-ui/react";

import RateSummaryCard from "./RateSummaryCard";

const SUMMARY_CARDS = [
  { key: "base", label: "평균 주간", color: "gray.900" },
  { key: "overtime", label: "평균 평일 잔업", color: "green.600" },
  { key: "daySpecial", label: "평균 주간 특근", color: "orange.500" },
  { key: "nightSpecial", label: "평균 야간 특근", color: "blue.600" },
  { key: "early", label: "평균 조기출근", color: "purple.600" },
];

export default function RateEditModalHeader({ summary, user }) {
  return (
    <Box bg="linear-gradient(135deg, #F0FFF4 0%, #EBF8FF 100%)" px={7} py={6}>
      <Flex justify="space-between" align="flex-start" gap={4}>
        <HStack spacing={4}>
          <Avatar name={user?.user_name} size="lg" bg="green.500" color="white" />
          <Box>
            <HStack spacing={2} mb={1}>
              <Text fontSize="xl" fontWeight="900" color="gray.900">
                {user?.user_name} 일급 상세
              </Text>
              <Badge colorScheme="green" borderRadius="full" px={3}>
                {summary.places}개 근무지
              </Badge>
            </HStack>
            <Text fontSize="sm" color="gray.600">
              근무지별 주간, 평일 잔업, 주간/야간 특근 수당을 관리합니다.
            </Text>
          </Box>
        </HStack>
        <ModalCloseButton position="static" />
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 5 }} spacing={3} mt={5}>
        {SUMMARY_CARDS.map((item) => (
          <RateSummaryCard
            key={item.key}
            label={item.label}
            value={summary[item.key]}
            color={item.color}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
}
