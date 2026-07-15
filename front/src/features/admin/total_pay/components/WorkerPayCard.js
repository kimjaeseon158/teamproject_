import { Badge, Box, Flex, HStack, Text } from "@chakra-ui/react";

import { formatWon } from "../utils/totalPayFormat";

export default function WorkerPayCard({ item }) {
  return (
    <Box p={3} bg="gray.50" borderRadius="md">
      <Flex justify="space-between" align="start" mb={2}>
        <Box minW={0}>
          <HStack spacing={2}>
            <Badge colorScheme={item.rank === 1 ? "blue" : "gray"}>
              #{item.rank}
            </Badge>
            <Text fontWeight="900" color="gray.800" noOfLines={1}>
              {item.name}
            </Text>
          </HStack>
          <Text fontSize="xs" color="gray.500" mt={1}>
            전체 대비 {item.percent}%
          </Text>
        </Box>
        <Text fontWeight="900" color="blue.600">
          {formatWon(item.amount)}
        </Text>
      </Flex>
      <Box h="8px" bg="white" borderRadius="full" overflow="hidden">
        <Box h="100%" w={`${Math.max(item.percent, 4)}%`} bg="blue.400" />
      </Box>
    </Box>
  );
}
