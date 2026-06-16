import { Tag } from "@chakra-ui/react";
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

const columns = [
  {
    key: "name",
    label: "이름",
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
    label: "근무일",
  },
  {
    key: "totalWorkHM",
    label: "근무시간",
  },
  {
    key: "location",
    label: "근무지",
    render: (value) => value || "-",
  },
];

export default function ApproveTable({ rows, selectedIds, toggleOne, onRowClick }) {
  const checkedItems = Object.fromEntries(
    rows.map((row) => [row.id, selectedIds.has(row.id)])
  );

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
