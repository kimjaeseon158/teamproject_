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
          <Heading size="lg" color="gray.800">
            일급 관리
          </Heading>
          <Badge colorScheme="green" borderRadius="full" px={3} py={1}>
            {loading ? "불러오는 중" : "최신 데이터"}
          </Badge>
        </HStack>
        <Text color="gray.500" fontSize="sm">
          직원별 근무지 일급 평균을 확인하고 수정합니다.
        </Text>
      </Box>


    </Flex>
  );
}
