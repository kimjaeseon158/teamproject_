import { Badge, Box, Card, CardBody, Flex, Heading, Text } from "@chakra-ui/react";

import PayDetailRow from "../components/PayDetailRow";
import { formatWon } from "../utils/totalPayFormat";

export default function PayDetailSection({
  apiMonth,
  detailData,
  selectedDetailMonth,
  selectedMonthTotal,
  totalExpense,
}) {
  return (
    <Card
      flex="1"
      border="1px solid"
      borderColor="gray.100"
      boxShadow="sm"
      minH={{ base: "360px", xl: "auto" }}
      overflow="hidden"
    >
      <CardBody display="flex" flexDirection="column">
        <Flex justify="space-between" align="center" mb={4}>
          <Box>
            <Heading size="sm" color="gray.800">
              선택 월 상세
            </Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>
              {selectedDetailMonth || apiMonth}
            </Text>
          </Box>
          <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
            {formatWon(totalExpense || selectedMonthTotal)}
          </Badge>
        </Flex>

        {detailData.length === 0 ? (
          <Box
            flex="1"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="gray.400"
            bg="gray.50"
            borderRadius="md"
          >
            급여 내역이 없습니다.
          </Box>
        ) : (
          <Box flex="1" overflowY="auto">
            {detailData.map((item, index) => (
              <PayDetailRow key={`${item.name}-${index}`} item={item} />
            ))}
          </Box>
        )}
      </CardBody>
    </Card>
  );
}
