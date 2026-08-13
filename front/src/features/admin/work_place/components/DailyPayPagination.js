import { Button, Flex, HStack } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";

export default function DailyPayPagination({ currentPage, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pageGroupSize = 5;
  const groupIndex = Math.floor((currentPage - 1) / pageGroupSize);
  const firstPage = groupIndex * pageGroupSize + 1;
  const lastPage = Math.min(firstPage + pageGroupSize - 1, totalPages);
  const pages = Array.from(
    { length: lastPage - firstPage + 1 },
    (_, index) => firstPage + index
  );

  return (
    <Flex justify="center" align="center" gap={2} px={6} py={5}>
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
    </Flex>
  );
}
