import { Button, HStack, IconButton, Text } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";

export default function ApprovePagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onChange,
}) {
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * pageSize + 1;
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
    <HStack
      position="relative"
      justify="center"
      px={5}
      py={4}
      borderTop="1px solid"
      borderColor="gray.100"
    >
      <Text fontSize="sm" color="gray.500" position="absolute" left={5}>
        {start.toLocaleString()}-{end.toLocaleString()} / {totalCount.toLocaleString()}건
      </Text>

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
    </HStack>
  );
}
