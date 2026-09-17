import { AddIcon, DeleteIcon, RepeatIcon, SearchIcon } from "@chakra-ui/icons";
import { Badge, Box, Button, Flex, Heading, HStack, Text } from "@chakra-ui/react";

export default function EmployeeListHeader({
  hasSearchFilter,
  selectedCount,
  onAdd,
  onSearchOpen,
  onShowAll,
  showAllLoading = false,
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
          <Badge display={{ base: "none", md: "inline-flex" }}
            colorScheme={hasSearchFilter ? "blue" : "green"}
            borderRadius="full"
            px={3}
            py={1}
          >
            {hasSearchFilter ? "검색 조건 입력됨" : "최신 데이터"}
          </Badge>
        </HStack>
        <Text display={{ base: "none", md: "block" }} color="gray.500" fontSize="sm">
          직원 정보를 등록, 검색, 수정하고 선택 삭제합니다.
        </Text>
      </Box>

      <HStack spacing={{ base: "clamp(8px, 2vw, 12px)", md: 2 }} flexWrap="wrap" rowGap={3} py={{ base: 1, md: 0 }}>
        <Button size={{ base: "xs", md: "md" }} minH={{ base: "32px", md: "40px" }} px={{ base: 2, md: 4 }} leftIcon={<AddIcon />} colorScheme="teal" onClick={onAdd}>
          직원 추가
        </Button>
        <Button size={{ base: "xs", md: "md" }} minH={{ base: "32px", md: "40px" }} px={{ base: 2, md: 4 }} leftIcon={<SearchIcon />} colorScheme="teal" variant="outline" onClick={onSearchOpen}>
          직원 검색
        </Button>
        <Button size={{ base: "sm", md: "md" }} leftIcon={<RepeatIcon />} colorScheme="gray" variant="ghost" onClick={onShowAll} isLoading={showAllLoading} loadingText="불러오는 중">
          전체 보기
        </Button>
        <Button
          display={{ base: selectedCount ? "inline-flex" : "none", md: "inline-flex" }}
          size={{ base: "sm", md: "md" }}
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
