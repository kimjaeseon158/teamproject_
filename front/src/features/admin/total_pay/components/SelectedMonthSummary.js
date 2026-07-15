import { Box, Text } from "@chakra-ui/react";

import { formatWon } from "../utils/totalPayFormat";

export default function SelectedMonthSummary({ selectedMonthTotal, workerCount }) {
  return (
    <Box
      minW="180px"
      p={3}
      bg="blue.50"
      borderRadius="md"
      border="1px solid"
      borderColor="blue.100"
    >
      <Text fontSize="xs" fontWeight="900" color="blue.600" mb={2}>
        선택 월 요약
      </Text>
      <Text fontSize="2xl" fontWeight="900" color="blue.700">
        {formatWon(selectedMonthTotal)}
      </Text>
      <Text fontSize="xs" color="blue.600" mt={2}>
        총 {workerCount.toLocaleString()}명 지급
      </Text>
    </Box>
  );
}
