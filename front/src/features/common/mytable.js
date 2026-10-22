import {
  Table, Thead, Tbody, Tr, Th, Td,
  Checkbox, Box,
} from "@chakra-ui/react";

export default function CommonTable({
  columns,
  data,
  selectable = false,
  checkedItems = {},
  disabledRowIds = new Set(),
  onCheck,
  selectAll,
  selectionWidth = "60px",
  selectionHeaderProps = {},
  selectionCellProps = {},
  onRowClick,
  rowKey = "id",
  containerRef,
  containerProps = {},
  tableProps = {},
}) {
  return (
    <Box
      ref={containerRef}
      p={6}
      bg="white"
      borderRadius="xl"
      boxShadow="sm"
      overflowX="auto"
      {...containerProps}
    >
      <Table variant="simple" size="md" {...tableProps}>
        <Thead bg="gray.50" h="60px">
          <Tr>
            {selectable && (
              <Th
                w={selectionWidth}
                minW={selectionWidth}
                textAlign="center"
                whiteSpace="nowrap"
                {...selectionHeaderProps}
              >
                {selectAll ? (
                  <Checkbox
                    size="md"
                    colorScheme="blue"
                    isChecked={selectAll.isChecked}
                    isIndeterminate={selectAll.isIndeterminate}
                    isDisabled={selectAll.isDisabled}
                    onChange={(e) => selectAll.onChange?.(e.target.checked)}
                  />
                ) : (
                  "선택"
                )}
              </Th>
            )}
            {columns.map(col => (
              <Th key={col.key} w={col.width || "auto"} textAlign={col.align || "center"} {...col.headerProps}>
                {col.label}
              </Th>
            ))}
          </Tr>
        </Thead>

        <Tbody>
          {data.map((row) => (
            <Tr
              key={row[rowKey]}
              onClick={() => onRowClick?.(row)}
              bg={selectable && checkedItems[row[rowKey]] ? "green.50" : "transparent"}
              _hover={{ bg: selectable && checkedItems[row[rowKey]] ? "green.50" : "gray.50" }}
              cursor={onRowClick ? "pointer" : "default"}
              role="group"
            >
              {selectable && (
                <Td
                  w={selectionWidth}
                  minW={selectionWidth}
                  textAlign="center"
                  onClick={(e) => e.stopPropagation()}
                  {...(typeof selectionCellProps === "function"
                    ? selectionCellProps(row)
                    : selectionCellProps)}
                >
                  <Checkbox
                    size="md"
                    colorScheme="blue"
                    isChecked={!!checkedItems[row[rowKey]]}
                    isDisabled={disabledRowIds.has(row[rowKey])}
                    onChange={() => onCheck?.(row[rowKey])}
                  />
                </Td>
              )}

              {columns.map(col => {
                const cellProps = typeof col.cellProps === "function" ? col.cellProps(row) : col.cellProps;
                return (
                  <Td key={col.key} w={col.width || "auto"} textAlign={col.align || "center"} {...cellProps}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </Td>
                );
              })}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
