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
  onRowClick,
  rowKey = "id",
}) {
  return (
    <Box
      p={6}
      bg="white"
      borderRadius="xl"
      boxShadow="sm"
      overflowX="auto"
    >
      <Table variant="simple" size="md">
        <Thead bg="gray.50" h="60px">
          <Tr>
            {selectable && (
              <Th w="60px" textAlign="center">
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
              <Th key={col.key}  w={col.width || "auto"}  textAlign={col.align || "center"}>{col.label}</Th>
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
            >
              {selectable && (
                <Td
                  w="60px"
                  textAlign="center"
                  onClick={(e) => e.stopPropagation()}
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

              {columns.map(col => (
                <Td key={col.key}  w={col.width || "auto"} textAlign={col.align || "center"}>
                  {col.render
                    ? col.render(row[col.key], row)
                    : row[col.key]}
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
