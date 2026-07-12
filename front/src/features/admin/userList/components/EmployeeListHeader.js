import { AddIcon, DeleteIcon, RepeatIcon, SearchIcon } from "@chakra-ui/icons";
import { Badge, Box, Button, Flex, Heading, HStack, Text } from "@chakra-ui/react";

export default function EmployeeListHeader({
  hasSearchFilter,
  selectedCount,
  onAdd,
  onSearchOpen,
  onShowAll,
  onDeleteSelected,
}) {
  return (
    <Flex
      justify="space-between"
      align={{ base: "stretch", md: "center" }}
      direction={{ base: "column", md: "row" }}
      gap={4}
      mb={6}
    >
      <Box>
        <HStack spacing={3} mb={2}>
          <Heading size="lg" color="gray.800">
            직원 관리
          </Heading>
          <Badge
            colorScheme={hasSearchFilter ? "blue" : "green"}
            borderRadius="full"
            px={3}
            py={1}
          >
            {hasSearchFilter ? "검색 조건 입력됨" : "최신 데이터"}
          </Badge>
        </HStack>
        <Text color="gray.500" fontSize="sm">
          직원 정보를 등록, 검색, 수정하고 선택 삭제합니다.
        </Text>
      </Box>

      <HStack spacing={2}>
        <Button leftIcon={<AddIcon />} colorScheme="green" onClick={onAdd}>
          직원 추가
        </Button>
        <Button leftIcon={<SearchIcon />} colorScheme="blue" variant="outline" onClick={onSearchOpen}>
          직원 검색
        </Button>
        <Button leftIcon={<RepeatIcon />} colorScheme="gray" variant="outline" onClick={onShowAll}>
          전체 보기
        </Button>
        <Button
          leftIcon={<DeleteIcon />}
          colorScheme="red"
          variant="outline"
          isDisabled={!selectedCount}
          onClick={onDeleteSelected}
        >
          선택 삭제
        </Button>
      </HStack>
    </Flex>
  );
}
