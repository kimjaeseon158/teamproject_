import {
  Box, Button, Flex, Heading,
  Table, Thead, Tbody, Tr, Th, Td, Checkbox
} from "@chakra-ui/react";
import { formatDotDate } from "../../../utils/dateUtils";

export default function CompanyTableSection({
  incomeData,
  finalList,
  onSelectRow,
  onRowClick,
  onOpenRange,
  onOpenAdd,
}) {
  return (
    <Box flex="2" minW="400px" bg="white" p={6} rounded="2xl">
      <Flex justify="space-between" mb={4}>
        <Heading size="md">업체별 매출</Heading>
        <Button size="sm" onClick={onOpenRange}>기간 선택</Button>
      </Flex>

      <Flex gap={2} mb={4}>
        <Button colorScheme="green" onClick={onOpenAdd}>
          업체 추가
        </Button>
      </Flex>

      <Table size="md">
        <Thead bg="gray.100">
          <Tr>
            <Th>선택</Th>
            <Th>날짜</Th>
            <Th>업체</Th>
            <Th>상세</Th>
            <Th isNumeric>금액</Th>
          </Tr>
        </Thead>
        <Tbody>
          {incomeData.map((item, idx) => (
            <Tr key={idx} _hover={{ bg: "gray.50" }} onClick={() => onRowClick(idx)}>
              <Td>
                <Checkbox
                  isChecked={finalList.includes(item)}
                  onChange={(e) => onSelectRow(idx, e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                />
              </Td>
              <Td>{formatDotDate(item.date)}</Td>
              <Td>{item.name}</Td>
              <Td>{item.detail || "-"}</Td>
              <Td isNumeric>{item.amount.toLocaleString()} 원</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
