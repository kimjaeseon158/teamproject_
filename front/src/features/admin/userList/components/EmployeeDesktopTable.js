import { AddIcon, DeleteIcon, RepeatIcon, SearchIcon } from "@chakra-ui/icons";
import { Badge, Box, Button, Flex, Heading, HStack } from "@chakra-ui/react";
import CommonTable from "../../../common/mytable";

export default function EmployeeDesktopTable({
  peopleData,
  columns,
  checkedItems,
  onCheck,
  selectAll,
  selectedCount,
  totalCount,
  onAdd,
  onSearchOpen,
  onReset,
  resetLoading = false,
  onDeleteSelected,
}) {
  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="gray.100"
      borderRadius="lg"
      boxShadow="sm"
      overflow="hidden"
    >
      <Flex
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap={3}
        px={6}
        py={4}
        borderBottom="1px solid"
        borderColor="gray.100"
      >
        <HStack spacing={2}>
          <Box>
            <Heading size="sm" color="gray.800">
              직원 목록
            </Heading>
          </Box>
          {selectedCount > 0 && (
            <Badge colorScheme="green" borderRadius="full" px={3} py={1}>
              {selectedCount.toLocaleString()}명 선택
            </Badge>
          )}
          <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
            {totalCount.toLocaleString()}명
          </Badge>
        </HStack>

        <HStack spacing={2} flexWrap="wrap" justify="flex-end">
          <Button size="sm" leftIcon={<AddIcon />} colorScheme="teal" onClick={onAdd}>
            직원 추가
          </Button>
          <Button size="sm" leftIcon={<SearchIcon />} colorScheme="teal" variant="outline" onClick={onSearchOpen}>
            직원 검색
          </Button>
          <Button size="sm" leftIcon={<RepeatIcon />} variant="outline" onClick={onReset} isLoading={resetLoading}>
            초기화
          </Button>
          <Button
            size="sm"
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

      <Box sx={{ "> div": { boxShadow: "none", borderRadius: 0 } }}>
        <CommonTable
          data={peopleData}
          columns={columns}
          rowKey="user_uuid"
          selectable
          checkedItems={checkedItems}
          onCheck={onCheck}
          selectAll={selectAll}
        />
      </Box>
    </Box>
  );
}
