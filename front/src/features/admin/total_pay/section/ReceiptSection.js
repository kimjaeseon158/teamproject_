import { Box, Flex, Heading } from "@chakra-ui/react";

export default function ReceiptSection({
  expenseData = [],
  totalExpense = 0,
  netProfit = 0,
}) {
  return (
    <Box h="100%" display="flex" flexDirection="column" justifyContent="space-between">
      <Box>
        <Heading size="md" textAlign="center" mb={4}>
          영수증
        </Heading>

        <Heading size="sm" mb={2}>
          최근 3개월 일급
        </Heading>

        {expenseData?.map((item, i) => (
          <Flex key={i} justify="space-between">
            <Box>{item.month}</Box>
            <Box>{(item.total ?? 0).toLocaleString()} 원</Box>
          </Flex>
        ))}

        <Flex justify="space-between" fontWeight="bold" mt={4}>
          <Box>총 일급 지출</Box>
          <Box>{(totalExpense ?? 0).toLocaleString()} 원</Box>
        </Flex>
      </Box>

      <Flex
        justify="space-between"
        fontWeight="bold"
        fontSize="xl"
        color={netProfit >= 0 ? "green.500" : "red.500"}
        mt={4}
      >
        <Box>순이익</Box>
        <Box>{(netProfit ?? 0).toLocaleString()} 원</Box>
      </Flex>
    </Box>
  );
}