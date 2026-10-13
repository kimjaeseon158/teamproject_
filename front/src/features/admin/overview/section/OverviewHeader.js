import { Box, Flex, Heading, HStack } from "@chakra-ui/react";

import MonthPicker from "../../../common/MonthPicker";
import { formatMonth } from "../utils/overviewFormat";

export default function OverviewHeader({
  currentDate,
  onMonthChange,
}) {
  return (
    <Flex justify="space-between" align="center" gap={3}>
      <Box>
        <HStack spacing={3} mb={1}>
          <Heading size="lg" color="gray.900">
          </Heading>
        </HStack>
      </Box>

      <HStack spacing={2}>
        <MonthPicker
          value={formatMonth(currentDate)}
          onChange={onMonthChange}
          size="sm"
          borderRadius="lg"
        />
      </HStack>
    </Flex>
  );
}
