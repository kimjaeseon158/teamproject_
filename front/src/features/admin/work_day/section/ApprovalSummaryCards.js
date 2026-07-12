import { Box, SimpleGrid, Text } from "@chakra-ui/react";

import { APPROVAL_SUMMARY_CARDS } from "../constants/approvalConstants";

export default function ApprovalSummaryCards({ summary, selectedCount }) {
  const values = {
    ...summary,
    selected: selectedCount,
  };

  return (
    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} mb={4}>
      {APPROVAL_SUMMARY_CARDS.map((item) => (
        <Box key={item.label} bg="white" border="1px solid" borderColor="gray.100" borderRadius="lg" p={4} boxShadow="sm">
          <Text fontSize="xs" color="gray.500" fontWeight="800" mb={1}>
            {item.label}
          </Text>
          <Text fontSize="2xl" fontWeight="900" color={`${item.color}.500`}>
            {Number(values[item.key] || 0).toLocaleString()}
          </Text>
        </Box>
      ))}
    </SimpleGrid>
  );
}
