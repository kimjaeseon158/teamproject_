import { Box, Flex, Heading } from "@chakra-ui/react";

export default function ReceiptSection({
  revenueByCompany,
  expenseData,
  totalRevenue,
  totalExpense,
  netProfit,
}) {
  return (
    <Box h="100%" display="flex" flexDirection="column" justifyContent="space-between">
      <Box>
        <Heading size="md" textAlign="center" mb={4}>
          매출 영수증
        </Heading>

        <Heading size="sm" mb={2}>업체별 매출</Heading>
        {revenueByCompany.map((item, i) => (
          <Flex key={i} justify="space-between">
            <Box>{item.name}</Box>
            <Box>{item.value.toLocaleString()} 원</Box>
          </Flex>
        ))}
        <Flex justify="space-between" fontWeight="bold" mt={2}>
          <Box>총 매출</Box>
          <Box>{totalRevenue.toLocaleString()} 원</Box>
        </Flex>

        <Heading size="sm" mt={6} mb={2}>지출 내역</Heading>
        {expenseData.map((item, i) => (
          <Flex key={i} justify="space-between">
            <Box>{item.name}</Box>
            <Box>{item.value.toLocaleString()} 원</Box>
          </Flex>
        ))}
        <Flex justify="space-between" fontWeight="bold" mt={2}>
          <Box>총 지출</Box>
          <Box>{totalExpense.toLocaleString()} 원</Box>
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
        <Box>{netProfit.toLocaleString()} 원</Box>
      </Flex>
    </Box>
  );
}
