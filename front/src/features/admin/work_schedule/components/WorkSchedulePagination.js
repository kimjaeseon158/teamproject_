import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { Button, Flex, HStack, Select, Text } from "@chakra-ui/react";
import { TABLE_PAGE_SIZE_OPTIONS } from "../../../../constants/pagination";

export default function WorkSchedulePagination({ currentPage, totalPages, totalCount, pageSize, onChange, onPageSizeChange, isDisabled = false }) {
  const groupSize = 5;
  const groupStart = Math.floor((currentPage - 1) / groupSize) * groupSize + 1;
  const groupEnd = Math.min(groupStart + groupSize - 1, totalPages);
  const pages = Array.from({ length: groupEnd - groupStart + 1 }, (_, index) => groupStart + index);
  const firstItem = totalCount ? (currentPage - 1) * pageSize + 1 : 0;
  const lastItem = Math.min(currentPage * pageSize, totalCount);

  return (
    <Flex position="relative" justify="center" align="center" minH="72px" px={{ base: 4, md: 6 }} py={4} borderTopWidth="1px" borderColor="gray.100">
      <Text position={{ base: "static", lg: "absolute" }} left={{ lg: 6 }} mr={{ base: "auto", lg: 0 }} fontSize="sm" color="gray.500">
        {firstItem}-{lastItem} / 총 {totalCount}명
      </Text>
      {totalPages > 1 && <HStack spacing={1}>
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
      </HStack>}
      <Select
        position={{ base: "static", lg: "absolute" }}
        right={{ lg: 6 }}
        ml={{ base: "auto", lg: 0 }}
        size="sm"
        w="130px"
        value={pageSize}
        isDisabled={isDisabled}
        onChange={(event) => onPageSizeChange(Number(event.target.value))}
        aria-label="페이지당 직원 수"
      >
        {TABLE_PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size}명씩 보기</option>)}
      </Select>
    </Flex>
  );
}
