import { Badge, Box, Flex, Heading, HStack, Text } from "@chakra-ui/react";

export default function DailyPayPageHeader({
  loading,
}) {
  return (
    <Flex
      justify="space-between"
      align={{ base: "stretch", md: "center" }}
      direction={{ base: "column", md: "row" }}
      gap={4}
      mb={6}
    >
      <Box>
        <HStack spacing={3} mb={2}>
          <Badge colorScheme="green" borderRadius="full" px={3} py={1}>
            {loading ? "불러오는 중" : "최신 데이터"}
          </Badge>
        </HStack>
      </Box>


    </Flex>
  );
}
