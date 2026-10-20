import { Badge, Box, Button, Flex, Heading, HStack, Text, Tooltip, VStack } from "@chakra-ui/react";
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
        align={{ base: "flex-start", sm: "center" }}
        gap={3}
        px={{ base: 4, md: 6 }}
        py={4}
        borderBottom="1px solid"
        borderColor="gray.100"
      >
        <VStack minW={0} align="flex-start" spacing={1}>
          <HStack spacing={2}>
            <Heading size="sm" color="gray.800">
              직원별 일급 평균
            </Heading>
            <Badge flexShrink={0} colorScheme="blue" borderRadius="full" px={3} py={1}>
              {totalCount.toLocaleString()}건
            </Badge>
          </HStack>
          <Text fontSize="xs" color="gray.500">
            표시 금액은 8시간 기준 일급입니다.
          </Text>
        </VStack>
        <Tooltip label="일급관리 문서 생성" hasArrow>
          <Button
            flexShrink={0}
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
