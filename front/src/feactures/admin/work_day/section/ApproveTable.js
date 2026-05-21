import {
  Box,
  Checkbox,
  Table,
  Tag,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";

const getStatusColor = (status) => {
  if (status === "승인") return "green";
  if (status === "거절" || status === "반려") return "red";
  return "yellow";
};

const StatusTag = ({ status }) => (
  <Tag size="sm" colorScheme={getStatusColor(status)} borderRadius="full">
    {status}
  </Tag>
);

export default function ApproveTable({ rows, selectedIds, toggleAll, toggleOne, onRowClick }) {
  const allChecked = rows.length > 0 && rows.every((r) => selectedIds.has(r.id));

  return (
    <Box overflowX="auto">
      <Table size="sm">
        <Thead bg="gray.50">
          <Tr>
            <Th w="40px">
              <Checkbox
                isChecked={allChecked}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => toggleAll(e.target.checked)}
              />
            </Th>
            <Th>직원</Th>
            <Th>근무 구분</Th>
            <Th>상태</Th>
            <Th>근무일</Th>
            <Th>근무 시간</Th>
            <Th>근무지</Th>
          </Tr>
        </Thead>

        <Tbody>
          {rows.map((r) => (
            <Tr
              key={r.id}
              onClick={() => onRowClick(r)}
              cursor="pointer"
              _hover={{ bg: "gray.50" }}
            >
              <Td onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                <Checkbox
                  isChecked={selectedIds.has(r.id)}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onChange={(e) => toggleOne(r.id, e.target.checked)}
                />
              </Td>
              <Td fontWeight="800" color="gray.800">{r.name}</Td>
              <Td fontWeight="bold">
                <Tag size="sm" colorScheme={r.workType === "야간" ? "purple" : r.workType === "특근" ? "orange" : "blue"}>
                  {r.workType || "근무"}
                </Tag>
              </Td>
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
