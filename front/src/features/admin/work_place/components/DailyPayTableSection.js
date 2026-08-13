import { Badge, Box, Flex, Heading, Text } from "@chakra-ui/react";

import DailyPayFixedTable from "./DailyPayFixedTable";
import DailyPayPagination from "./DailyPayPagination";

export default function DailyPayTableSection({
  columns,
  currentPage,
  data,
  totalCount,
  totalPages,
  onEdit,
  onPageChange,
  onSort,
  sortField,
  sortOrder,
}) {
  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="gray.100"
      borderRadius="lg"
      boxShadow="sm"
      overflow="hidden"
      maxW="100%"
    >
      <Flex
        justify="space-between"
        align="center"
        px={6}
        py={4}
        borderBottom="1px solid"
        borderColor="gray.100"
      >
        <Box>
          <Heading size="sm" color="gray.800">
            직원별 일급 평균
          </Heading>
          <Text fontSize="sm" color="gray.500" mt={1}>
            평균 금액은 등록된 근무지 단가를 기준으로 계산합니다.
          </Text>
        </Box>
        <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
          {totalCount.toLocaleString()}건
        </Badge>
      </Flex>

      <Box p={0}>
        <DailyPayFixedTable
          columns={columns}
          data={data}
          onEdit={onEdit}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={onSort}
        />
        <DailyPayPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onChange={onPageChange}
        />
      </Box>
    </Box>
  );
}
