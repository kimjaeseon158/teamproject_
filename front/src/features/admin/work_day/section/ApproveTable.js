import { Button, HStack, Tag, Text } from "@chakra-ui/react";
import CommonTable from "../../../common/mytable";

const getStatusColor = (status) => {
  if (status === "승인") return "green";
  if (status === "거절" || status === "반려") return "red";
  return "yellow";
};

const getWorkTypeColor = (type) => {
  if (type === "야간") return "purple";
  if (type === "특근") return "orange";
  return "blue";
};

const SortLabel = ({ children, sortKey, sortField, sortOrder, onSort }) => {
  const isActive = sortField === sortKey;
  const mark = !isActive ? "↕" : sortOrder === "asc" ? "↑" : "↓";

  return (
    <Button size="xs" variant="ghost" onClick={() => onSort(sortKey)}>
      <HStack spacing={1}>
        <Text>{children}</Text>
        <Text color={isActive ? "blue.500" : "gray.400"}>{mark}</Text>
      </HStack>
    </Button>
  );
};

const getColumns = ({ sortField, sortOrder, onSort }) => [
  {
    key: "name",
    label: (
      <SortLabel sortKey="name" sortField={sortField} sortOrder={sortOrder} onSort={onSort}>
        이름
      </SortLabel>
    ),
    render: (value) => <strong>{value}</strong>,
  },
  {
    key: "workType",
    label: "근무구분",
    render: (value) => (
      <Tag size="sm" colorScheme={getWorkTypeColor(value)} borderRadius="full">
        {value || "근무"}
      </Tag>
    ),
  },
  {
    key: "status",
    label: "상태",
    render: (value) => (
      <Tag size="sm" colorScheme={getStatusColor(value)} borderRadius="full">
        {value}
      </Tag>
    ),
  },
  {
    key: "date",
    label: (
      <SortLabel sortKey="date" sortField={sortField} sortOrder={sortOrder} onSort={onSort}>
        근무일
      </SortLabel>
    ),
  },
  {
    key: "totalWorkDisplay",
    label: (
      <SortLabel sortKey="totalWorkMinutes" sortField={sortField} sortOrder={sortOrder} onSort={onSort}>
        총근무 시간
      </SortLabel>
    ),
    render: (value, row) => value || row.totalWorkHM || "-",
  },
  {
    key: "location",
    label: "근무지",
    render: (value) => value || "-",
  },
];

export default function ApproveTable({
  rows,
  selectedIds,
  toggleOne,
  onRowClick,
  sortField,
  sortOrder,
  onSort,
}) {
  const checkedItems = Object.fromEntries(
    rows.map((row) => [row.id, selectedIds.has(row.id)])
  );
  const columns = getColumns({ sortField, sortOrder, onSort });

  return (
    <CommonTable
      columns={columns}
      data={rows}
      rowKey="id"
      selectable
      checkedItems={checkedItems}
      onCheck={(id) => toggleOne(id, !selectedIds.has(id))}
      onRowClick={onRowClick}
    />
  );
}
