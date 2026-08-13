import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { Button, Flex, HStack, Text } from "@chakra-ui/react";

export default function WorkSchedulePagination({ currentPage, totalPages, totalCount, pageSize, onChange }) {
  if (totalPages <= 1) return null;

  const groupSize = 5;
  const groupStart = Math.floor((currentPage - 1) / groupSize) * groupSize + 1;
  const groupEnd = Math.min(groupStart + groupSize - 1, totalPages);
  const pages = Array.from({ length: groupEnd - groupStart + 1 }, (_, index) => groupStart + index);
  const firstItem = (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(currentPage * pageSize, totalCount);

  return (
    <Flex position="relative" justify="center" align="center" minH="64px" px={5} py={3} borderTopWidth="1px" borderColor="gray.100">
      <Text position="absolute" left={5} fontSize="sm" color="gray.500">
        {firstItem}-{lastItem} / 총 {totalCount}명
      </Text>
      <HStack spacing={1}>
        <Button size="sm" variant="ghost" leftIcon={<ChevronLeftIcon />} isDisabled={currentPage === 1} onClick={() => onChange(currentPage - 1)}>
          이전
        </Button>
        {pages.map((page) => (
          <Button key={page} size="sm" minW="34px" px={2} variant={page === currentPage ? "solid" : "ghost"} colorScheme={page === currentPage ? "blue" : "gray"} onClick={() => onChange(page)}>
            {page}
          </Button>
        ))}
        <Button size="sm" variant="ghost" rightIcon={<ChevronRightIcon />} isDisabled={currentPage === totalPages} onClick={() => onChange(currentPage + 1)}>
          다음
        </Button>
      </HStack>
    </Flex>
  );
}
