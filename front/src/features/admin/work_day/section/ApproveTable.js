import { Tag } from "@chakra-ui/react";
import CommonTable from "../../../common/mytable";
import SortableHeaderLabel from "../../../common/SortableHeaderLabel";
import { isApprovedStatus, isRejectedStatus } from "../utils/approveUtils";

const getStatusColor = (status) => {
  if (isApprovedStatus(status)) return "green";
  if (isRejectedStatus(status)) return "red";
  return "yellow";
};

const getWorkTypeColor = (type) => {
  if (String(type || "").includes("야간")) return "purple";
  if (String(type || "").includes("특근")) return "orange";
  return "blue";
};

const getColumns = ({ sortField, sortOrder, onSort }) => [
  {
    key: "name",
    label: (
      <SortableHeaderLabel sortKey="name" sortField={sortField} sortOrder={sortOrder} onSort={onSort}>
        이름
      </SortableHeaderLabel>
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
      <SortableHeaderLabel sortKey="date" sortField={sortField} sortOrder={sortOrder} onSort={onSort}>
        근무일
      </SortableHeaderLabel>
    ),
  },
  {
    key: "totalWorkDisplay",
    label: (
      <SortableHeaderLabel sortKey="totalWorkMinutes" sortField={sortField} sortOrder={sortOrder} onSort={onSort}>
        총근무시간
      </SortableHeaderLabel>
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
  toggleAll,
  toggleOne,
  onRowClick,
  sortField,
  sortOrder,
  onSort,
}) {
  const selectableIds = rows.map((row) => row.id);
  const selectedOnPageCount = selectableIds.filter((id) => selectedIds.has(id)).length;
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
      selectAll={{
        isChecked: selectableIds.length > 0 && selectedOnPageCount === selectableIds.length,
        isIndeterminate: selectedOnPageCount > 0 && selectedOnPageCount < selectableIds.length,
        isDisabled: selectableIds.length === 0,
        onChange: (checked) => toggleAll(checked, selectableIds),
      }}
      onCheck={(id) => {
        toggleOne(id, !selectedIds.has(id));
      }}
      onRowClick={onRowClick}
    />
  );
}
