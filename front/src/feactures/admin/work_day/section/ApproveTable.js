import {
  Table, Thead, Tbody, Tr, Th, Td,
  Checkbox, Tag, Box
} from "@chakra-ui/react";

const StatusTag = ({ status }) => (
  <Tag size="sm" colorScheme={status === "승인" ? "green" : status === "거절" ? "red" : "yellow"}>
    {status}
  </Tag>
);

export default function ApproveTable({ rows, selectedIds, toggleAll, toggleOne, onRowClick }) {
  const allChecked = rows.length > 0 && rows.every((r) => selectedIds.has(r.id));
  const isIndeterminate =
    rows.some((r) => selectedIds.has(r.id)) && !allChecked;

  return (
    <Box border="1px solid black" borderRadius="12px" overflow="hidden">
      <Table>
        <Thead bg="gray.50">
          <Tr>
            <Th w="40px">
              <Checkbox
                isChecked={allChecked}
                isIndeterminate={isIndeterminate}
                onChange={(e) => toggleAll(e.target.checked)}
              />
            </Th>
            <Th>이름</Th>
            <Th>근무구분</Th>
            <Th>상태</Th>
            <Th>근무일</Th>
            <Th>근무 시간</Th>
            <Th>근무지</Th>
          </Tr>
        </Thead>

        <Tbody>
          {rows.map((r) => (
            <Tr key={r.id} onClick={() => onRowClick(r)} cursor="pointer">
              <Td>
                <Checkbox
                  isChecked={selectedIds.has(r.id)}
                  onChange={(e) => toggleOne(r.id, e.target.checked)}
                />
              </Td>
              <Td>{r.name}</Td>
              <Td fontWeight="bold">{r.workType}</Td>
              <Td><StatusTag status={r.status} /></Td>
              <Td>{r.date}</Td>
              <Td>{r.dayHM}</Td>
              <Td>{r.location}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
