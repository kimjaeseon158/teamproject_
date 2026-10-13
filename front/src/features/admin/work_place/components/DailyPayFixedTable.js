import { Box, Button, Text } from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";

import CommonTable from "../../../common/mytable";
import SortableHeaderLabel from "../../../common/SortableHeaderLabel";

const stickyColumnProps = (side, offset = 0) => ({
  position: "sticky",
  [side]: offset,
  zIndex: 3,
  bg: "white",
  _groupHover: { bg: "gray.50" },
  boxShadow: side === "left" ? "2px 0 0 #EDF2F7" : "-2px 0 0 #EDF2F7",
});

const stickyHeaderProps = (side, offset = 0) => ({
  ...stickyColumnProps(side, offset),
  zIndex: 4,
  bg: "gray.50",
});

const getColumnWidth = (key) => {
  if (key === "user_name") return { base: "140px", md: "190px" };
  if (key === "work_place") return "280px";
  return "150px";
};

export default function DailyPayFixedTable({ columns, data, onEdit, sortField, sortOrder, onSort }) {
  const sortableLabel = (column) => (
    <SortableHeaderLabel
      sortKey={column.key}
      sortField={sortField}
      sortOrder={sortOrder}
      onSort={onSort}
    >
      {column.label}
    </SortableHeaderLabel>
  );

  const tableColumns = [
    ...columns.map((column) => {
      const width = getColumnWidth(column.key);
      const isNameColumn = column.key === "user_name";
      const isWorkPlaceColumn = column.key === "work_place";
      const stickyLeft = isNameColumn
        ? stickyColumnProps("left")
        : isWorkPlaceColumn
          ? stickyColumnProps("left", { base: "140px", md: "190px" })
          : {};
      const stickyLeftHeader = isNameColumn
        ? stickyHeaderProps("left")
        : isWorkPlaceColumn
          ? stickyHeaderProps("left", { base: "140px", md: "190px" })
          : {};

      return {
        ...column,
        label: sortableLabel(column),
        width,
        align: column.key === "work_place" ? "left" : "center",
        headerProps: {
          minW: width,
          whiteSpace: "nowrap",
          ...stickyLeftHeader,
        },
        cellProps: {
          minW: width,
          whiteSpace: "nowrap",
          color: "gray.700",
          ...stickyLeft,
          ...(isNameColumn ? {
            fontWeight: "800",
            color: "gray.800",
          } : {}),
        },
        render: (value, row) => (
          <Text noOfLines={1}>
            {column.render ? column.render(value, row) : value || "-"}
          </Text>
        ),
      };
    }),
    {
      key: "manage",
      label: "관리",
      width: { base: "96px", md: "120px" },
      headerProps: {
        minW: { base: "96px", md: "120px" },
        whiteSpace: "nowrap",
        ...stickyHeaderProps("right"),
      },
      cellProps: {
        minW: { base: "96px", md: "120px" },
        ...stickyColumnProps("right"),
      },
      render: (_value, row) => (
        <Button
          size="sm"
          leftIcon={<EditIcon />}
          colorScheme="green"
          variant="ghost"
          onClick={() => onEdit(row)}
        >
          수정
        </Button>
      ),
    },
  ];

  return (
    <Box p={6} overflow="hidden">
      <CommonTable
        columns={tableColumns}
        data={data}
        rowKey="user_uuid"
        tableProps={{
          w: "max-content",
          minW: "100%",
          tableLayout: "fixed",
          borderCollapse: "separate",
          borderSpacing: 0,
        }}
        containerProps={{
          p: 0,
          borderRadius: 0,
          boxShadow: "none",
          maxW: "100%",
          isolation: "isolate",
          sx: {
            "&::-webkit-scrollbar": { height: "10px" },
            "&::-webkit-scrollbar-track": { background: "#EDF2F7" },
            "&::-webkit-scrollbar-thumb": { background: "#A0AEC0", borderRadius: "999px" },
          },
        }}
      />
    </Box>
  );
}
