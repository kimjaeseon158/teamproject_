import { Box, Button, Flex, HStack, IconButton, Select, Text } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { TABLE_PAGE_SIZE_OPTIONS } from "../../../../constants/pagination";

export default function ApprovePagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onChange,
  onPageSizeChange,
}) {
  const start = totalCount ? (currentPage - 1) * pageSize + 1 : 0;
  const end = Math.min(currentPage * pageSize, totalCount);
  const pageGroupSize = 5;
  const groupIndex = Math.floor((currentPage - 1) / pageGroupSize);
  const firstPage = groupIndex * pageGroupSize + 1;
  const lastPage = Math.min(firstPage + pageGroupSize - 1, totalPages);
  const visiblePages = Array.from(
    { length: lastPage - firstPage + 1 },
    (_, index) => firstPage + index
  );
  const hasPreviousGroup = firstPage > 1;
  const hasNextGroup = lastPage < totalPages;
  const previousGroupPage = Math.max(1, firstPage - pageGroupSize);
  const nextGroupPage = Math.min(totalPages, lastPage + 1);

  return (
    <Flex
      direction={{ base: "column", md: "row" }}
      gap={{ base: 3, md: 2 }}
      align="center"
      px={5}
      py={4}
      borderTop="1px solid"
      borderColor="gray.100"
    >
      <Box w={{ base: "100%", md: "auto" }} flex={{ md: 1 }} textAlign={{ base: "center", md: "left" }}>
        <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
          {start.toLocaleString()}-{end.toLocaleString()} / {totalCount.toLocaleString()}건
        </Text>
      </Box>

      <Flex w={{ base: "100%", md: "auto" }} align="center" justify={{ base: "space-between", md: "center" }} gap={3}>
        <HStack spacing={1}>
          <IconButton
            aria-label="이전 페이지 그룹"
            icon={<ChevronLeftIcon />}
            size="sm"
            variant="ghost"
            isDisabled={!hasPreviousGroup}
            onClick={() => onChange(previousGroupPage)}
          />

          {visiblePages.map((page) => (
            <Button
              key={page}
              size="sm"
              minW="32px"
              px={2}
              variant={page === currentPage ? "solid" : "ghost"}
              colorScheme={page === currentPage ? "blue" : "gray"}
              onClick={() => onChange(page)}
            >
              {page}
            </Button>
          ))}

          {hasNextGroup && (
            <Text px={2} color="gray.400" fontWeight="700">
              ...
            </Text>
          )}

          <IconButton
            aria-label="다음 페이지 그룹"
            icon={<ChevronRightIcon />}
            size="sm"
            variant="ghost"
            isDisabled={!hasNextGroup}
            onClick={() => onChange(nextGroupPage)}
          />
        </HStack>
        {onPageSizeChange && (
          <Select
            display={{ base: "block", md: "none" }}
            size="sm"
            w="128px"
            flexShrink={0}
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
          >
            {TABLE_PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>{size}개씩 보기</option>
            ))}
          </Select>
        )}
      </Flex>

      <Box flex={{ md: 1 }} textAlign="right" display={{ base: "none", md: "block" }}>
        {onPageSizeChange && (
          <Select
            display="inline-block"
            size="sm"
            w="140px"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
          >
            {TABLE_PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>{size}개씩 보기</option>
            ))}
          </Select>
        )}
      </Box>
    </Flex>
  );
}
