import { Box, Button, Flex, HStack, Select, Text } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { TABLE_PAGE_SIZE_OPTIONS } from "../../../../constants/pagination";

export default function DailyPayPagination({ currentPage, totalPages, totalCount, pageSize, onChange, onPageSizeChange }) {
  const start = totalCount ? (currentPage - 1) * pageSize + 1 : 0;
  const end = Math.min(currentPage * pageSize, totalCount);
  const pageGroupSize = 5;
  const groupIndex = Math.floor((currentPage - 1) / pageGroupSize);
  const firstPage = groupIndex * pageGroupSize + 1;
  const lastPage = Math.min(firstPage + pageGroupSize - 1, totalPages);
  const pages = Array.from(
    { length: lastPage - firstPage + 1 },
    (_, index) => firstPage + index
  );

  return (
    <Flex align="center" gap={2} px={6} py={4} borderTopWidth="1px" borderColor="gray.100">
      <Text flex="1" fontSize="sm" color="gray.500">
        {start.toLocaleString()}-{end.toLocaleString()} / 총 {totalCount.toLocaleString()}명
      </Text>

      {totalPages > 1 && <HStack spacing={2}>
      <Button
        size="sm"
        leftIcon={<ChevronLeftIcon />}
        variant="outline"
        isDisabled={currentPage === 1}
        onClick={() => onChange(Math.max(1, currentPage - 1))}
      >
        이전
      </Button>
      <HStack spacing={1}>
        {pages.map((page) => (
          <Button
            key={page}
            size="sm"
            minW="36px"
            variant={page === currentPage ? "solid" : "ghost"}
            colorScheme={page === currentPage ? "blue" : "gray"}
            onClick={() => onChange(page)}
          >
            {page}
          </Button>
        ))}
      </HStack>

      <Button
        size="sm"
        rightIcon={<ChevronRightIcon />}
        variant="outline"
        isDisabled={currentPage === totalPages}
        onClick={() => onChange(Math.min(totalPages, currentPage + 1))}
      >
        다음
      </Button>
      </HStack>}

      <Box flex="1" textAlign="right">
        <Select display="inline-block" size="sm" w="140px" value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))}>
          {TABLE_PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size}명씩 보기</option>)}
        </Select>
      </Box>
    </Flex>
  );
}
