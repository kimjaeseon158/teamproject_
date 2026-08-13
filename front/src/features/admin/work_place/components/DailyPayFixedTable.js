import {
  Box,
  Button,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";

import SortableHeaderLabel from "../../../common/SortableHeaderLabel";

const HEADER_HEIGHT = "54px";
const ROW_HEIGHT = "58px";

const fixedTableSx = {
  tableLayout: "fixed",
  "th, td": {
    h: ROW_HEIGHT,
    maxH: ROW_HEIGHT,
    py: 0,
    verticalAlign: "middle",
  },
  th: {
    h: HEADER_HEIGHT,
    maxH: HEADER_HEIGHT,
  },
};

export default function DailyPayFixedTable({
  columns,
  data,
  onEdit,
  sortField,
  sortOrder,
  onSort,
}) {
  const detailColumns = columns.filter((column) => column.key !== "user_name");
  const nameColumn = columns.find((column) => column.key === "user_name");
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

  return (
    <Box
      display="grid"
      gridTemplateColumns={{
        base: "140px minmax(0, 1fr) 96px",
        md: "190px minmax(0, 1fr) 120px",
      }}
      w="100%"
      maxW="100%"
      overflow="hidden"
    >
      <Box minW={0} borderRight="1px solid" borderColor="gray.100">
        <Table variant="simple" size="md" sx={fixedTableSx}>
          <Thead bg="gray.50">
            <Tr>
              <Th whiteSpace="nowrap">
                {nameColumn ? sortableLabel(nameColumn) : "이름"}
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.map((row) => (
              <Tr key={row.user_uuid} _hover={{ bg: "gray.50" }}>
                <Td fontWeight="800" color="gray.800">
                  <Text noOfLines={1}>{row.user_name}</Text>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <Box
        minW={0}
        maxW="100%"
        overflowX="auto"
        overflowY="hidden"
        pb={2}
        sx={{
          "&::-webkit-scrollbar": { height: "10px" },
          "&::-webkit-scrollbar-track": { background: "#EDF2F7" },
          "&::-webkit-scrollbar-thumb": {
            background: "#A0AEC0",
            borderRadius: "999px",
          },
        }}
      >
        <Table variant="simple" size="md" w="max-content" minW="1320px" sx={fixedTableSx}>
          <Thead bg="gray.50">
            <Tr>
              {detailColumns.map((column) => (
                <Th
                  key={column.key}
                  minW={column.key === "work_place" ? "280px" : "150px"}
                  textAlign="center"
                  whiteSpace="nowrap"
                >
                  {sortableLabel(column)}
                </Th>
              ))}
            </Tr>
          </Thead>

          <Tbody>
            {data.map((row) => (
              <Tr key={row.user_uuid} _hover={{ bg: "gray.50" }}>
                {detailColumns.map((column) => (
                  <Td
                    key={column.key}
                    minW={column.key === "work_place" ? "280px" : "150px"}
                    textAlign={column.key === "work_place" ? "left" : "center"}
                    whiteSpace="nowrap"
                    color="gray.700"
                  >
                    <Text noOfLines={1}>
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key] || "-"}
                    </Text>
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <Box minW={0} borderLeft="1px solid" borderColor="gray.100">
        <Table variant="simple" size="md" sx={fixedTableSx}>
          <Thead bg="gray.50">
            <Tr>
              <Th textAlign="center" whiteSpace="nowrap">
                관리
              </Th>
            </Tr>
          </Thead>

          <Tbody>
            {data.map((row) => (
              <Tr key={row.user_uuid} _hover={{ bg: "gray.50" }}>
                <Td textAlign="center">
                  <Button
                    size="sm"
                    leftIcon={<EditIcon />}
                    colorScheme="green"
                    variant="ghost"
                    onClick={() => onEdit(row)}
                  >
                    수정
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}
