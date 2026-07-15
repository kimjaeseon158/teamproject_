import { Button, HStack, Text } from "@chakra-ui/react";

export default function SortableHeaderLabel({
  children,
  sortKey,
  sortField,
  sortOrder,
  onSort,
}) {
  const isActive = sortField === sortKey;
  const sortIcon = isActive && sortOrder === "asc" ? "↑" : "↓";

  return (
    <Button size="xs" variant="ghost" onClick={() => onSort(sortKey)}>
      <HStack spacing={2}>
        <Text>{children}</Text>
        <Text
          minW="14px"
          textAlign="center"
          fontSize="xl"
          fontWeight="black"
          lineHeight="1"
          color={isActive ? "blue.600" : "gray.500"}
        >
          {sortIcon}
        </Text>
      </HStack>
    </Button>
  );
}
