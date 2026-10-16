import { Badge, Box, Button, Flex, Heading, HStack, Tooltip } from "@chakra-ui/react";
import { DownloadIcon } from "@chakra-ui/icons";

import DailyPayFixedTable from "./DailyPayFixedTable";
import DailyPayPagination from "./DailyPayPagination";

export default function DailyPayTableSection({
  columns,
  currentPage,
  data,
  totalCount,
  totalPages,
  pageSize,
  onEdit,
  onPageChange,
  onPageSizeChange,
  onSort,
  sortField,
  sortOrder,
  onExcelOpen,
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
        <HStack spacing={3}>
          <Heading size="sm" color="gray.800">
            직원별 일급 평균
          </Heading>
          <Tooltip label="일급관리 문서 생성" hasArrow>
            <Button
              leftIcon={<DownloadIcon />}
              bg="green.50"
              color="green.700"
              borderWidth="1px"
              borderColor="green.200"
              _hover={{ bg: "green.100", borderColor: "green.300" }}
              _active={{ bg: "green.200" }}
              size="sm"
              minW="118px"
              onClick={onExcelOpen}
            >
              엑셀 다운로드
            </Button>
          </Tooltip>
        </HStack>
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
          totalCount={totalCount}
          pageSize={pageSize}
          onChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </Box>
    </Box>
  );
}
