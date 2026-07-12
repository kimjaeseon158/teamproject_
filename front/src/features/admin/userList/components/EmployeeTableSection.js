import { Badge, Box, Flex, Heading, HStack, Text } from "@chakra-ui/react";

import CommonTable from "../../../common/mytable";

export default function EmployeeTableSection({
  peopleData,
  columns,
  checkedItems,
  onCheck,
  selectAll,
  selectedCount,
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
        <Box>
          <Heading size="sm" color="gray.800">
            직원 목록
          </Heading>
          <Text fontSize="sm" color="gray.500" mt={1}>
            테이블의 수정 버튼으로 직원 상세 정보를 확인하고 수정할 수 있습니다.
          </Text>
        </Box>

        <HStack spacing={2}>
          {selectedCount > 0 && (
            <Badge colorScheme="green" borderRadius="full" px={3} py={1}>
              {selectedCount.toLocaleString()}명 선택
            </Badge>
          )}
          <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
            {peopleData.length.toLocaleString()}명
          </Badge>
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
