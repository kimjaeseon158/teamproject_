import {
  Box, Button, Flex, Heading,
  Table, Thead, Tbody, Tr, Th, Td, Checkbox
} from "@chakra-ui/react";
import { formatDotDate } from "../../../utils/dateUtils";

export default function ExpenseTableSection({
  expenseData,
  finalList,
  onSelectRow,
  onRowClick,
  onOpenRange,
  onOpenAdd,
}) {
  return (
    <Box flex="2" minW="400px" bg="white" p={6} rounded="2xl">
      <Flex justify="space-between" mb={4}>
        <Heading size="md">지출 내역</Heading>
        <Button size="sm" onClick={onOpenRange}>기간 선택</Button>
      </Flex>

      <Button colorScheme="red" mb={4} onClick={onOpenAdd}>
        지출 추가
      </Button>

      <Table size="md">
        <Thead bg="gray.100">
          <Tr>
            <Th>선택</Th>
            <Th>날짜</Th>
            <Th>항목</Th>
            <Th>상세</Th>
            <Th isNumeric>금액</Th>
          </Tr>
        </Thead>
        <Tbody>
          {expenseData.map((item, idx) => (
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
