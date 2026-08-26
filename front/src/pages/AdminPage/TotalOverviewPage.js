import { Box, Center, Heading, Text } from "@chakra-ui/react";

export default function TotalOverviewPage() {
  return (
    <Box minH="calc(100vh - 92px)" bg="gray.50">
      <Center minH="calc(100vh - 92px)" flexDirection="column" px={6} textAlign="center">
        <Heading size="md" color="gray.700" mb={2}>
          통합 금액 화면
        </Heading>
        <Text color="gray.500" fontSize="sm">
          준비 중입니다.
        </Text>
      </Center>
    </Box>
  );
}
