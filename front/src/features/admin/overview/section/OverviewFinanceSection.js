import { Box, Button, Divider, Flex, Text, VStack } from "@chakra-ui/react";

import DashboardCard from "../components/DashboardCard";
import SectionHeader from "../components/SectionHeader";
import { formatWon } from "../utils/overviewFormat";

export default function OverviewFinanceSection({
  threeMonthData,
  financeTotal,
  onNavigateFinance,
  onRemove,
}) {
  const maxValue = Math.max(...threeMonthData.map((month) => Number(month.total || 0)), 1);

  return (
    <DashboardCard p={3} display="flex" flexDirection="column" overflow="hidden">
      <SectionHeader
        title="급여 현황"
        onRemove={onRemove}
        action={<Button size="xs" variant="outline" onClick={onNavigateFinance}>상세</Button>}
      />
      <Flex align="end" gap={3} flex="1" minH="180px" px={1}>
        {threeMonthData.map((item) => {
          const total = Number(item.total || 0);
          const percent = total > 0 ? Math.max((total / maxValue) * 100, 10) : 0;

          return (
            <Flex key={item.key} direction="column" align="center" justify="end" flex="1" h="100%" gap={2}>
              <Flex
                w="100%"
                maxW="54px"
                flex="1"
                minH="92px"
                direction="column"
                justify="end"
                gap={1}
                align="end"
                borderBottom="1px solid"
                borderColor="gray.300"
              >
                <Text fontSize="xs" fontWeight="800" color="gray.600" noOfLines={1} w="max-content" alignSelf="center">
                  {formatWon(item.total)}
                </Text>
                {total > 0 && (
                  <Box
                    w="100%"
                    h={`${percent}%`}
                    minH="14px"
                    bg="blue.400"
                    borderRadius="md"
                  />
                )}
              </Flex>
              <Text fontSize="11px" color="gray.500" noOfLines={1}>
                {item.label}
              </Text>
            </Flex>
          );
        })}
      </Flex>
      <VStack align="stretch" spacing={2} mt="auto" pt={3}>
        <Divider />
        <Flex justify="space-between">
          <Text fontWeight="900">3개월 합계</Text>
          <Text fontWeight="900" color="blue.600">{formatWon(financeTotal)}</Text>
        </Flex>
      </VStack>
    </DashboardCard>
  );
}
