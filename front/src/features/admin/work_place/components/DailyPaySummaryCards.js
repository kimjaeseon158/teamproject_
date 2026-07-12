import { Box, Button, Flex, SimpleGrid, Text, Tooltip } from "@chakra-ui/react";

export default function DailyPaySummaryCards({ cards }) {
  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
      {cards.map((card) => (
        <Box
          key={card.label}
          bg="white"
          border="1px solid"
          borderColor="gray.100"
          borderRadius="lg"
          p={5}
          boxShadow="sm"
        >
          <Flex justify="space-between" align="flex-start" gap={3}>
            <Box>
              <Text fontSize="sm" fontWeight="700" color="gray.500" mb={2}>
                {card.label}
              </Text>
              <Text fontSize="2xl" fontWeight="900" color="gray.800">
                {card.value}
              </Text>
            </Box>
            {card.action && (
              <Tooltip label="근무지 추가/수정" hasArrow>
                <Button
                  aria-label="근무지 추가/수정"
                  size="sm"
                  colorScheme="blue"
                  variant="outline"
                  onClick={card.action}
                >
                  자세히 보기
                </Button>
              </Tooltip>
            )}
          </Flex>
        </Box>
      ))}
    </SimpleGrid>
  );
}
