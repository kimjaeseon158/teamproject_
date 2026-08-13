import { Box, Text } from "@chakra-ui/react";

import { formatWon } from "../utils/rateFormat";

export default function RateSummaryCard({ label, value, color = "gray.900" }) {
  return (
    <Box bg="whiteAlpha.900" border="1px solid" borderColor="white" borderRadius="xl" p={4}>
      <Text fontSize="xs" color="gray.500" fontWeight="800">
        {label}
      </Text>
      <Text fontSize="2xl" fontWeight="900" color={color}>
        {formatWon(value)}
      </Text>
    </Box>
  );
}
