import { Box, Text } from "@chakra-ui/react";

import { formatWon } from "../utils/rateFormat";

export default function RateSummaryCard({ label, value, color = "gray.900" }) {
  return (
    <Box
      bg="whiteAlpha.900"
      border="1px solid"
      borderColor="white"
      borderRadius="xl"
      px={5}
      py={4}
      minH="108px"
      display="flex"
      flexDirection="column"
      justifyContent="center"
    >
      <Text fontSize="sm" color="gray.500" fontWeight="800" mb={1}>
        {label}
      </Text>
      <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="900" color={color}>
        {formatWon(value)}
      </Text>
    </Box>
  );
}
