import {
  Table, Thead, Tbody, Tr, Th, Td,
  Checkbox, Box,
} from "@chakra-ui/react";

export default function AdminTable({
  data,
  checkedItems,
  onCheck,
  onRowClick,
}) {
  return (
    <Box p={4} bg="#f9f9f9" borderRadius="md" overflowX="auto">
      <Table tableLayout="fixed">
        <Thead>
          <Tr>
            <Th w="36px" px={1} textAlign="center">선택</Th>
            <Th>이름</Th>
            <Th>주민등록번호</Th>
            <Th>주소</Th>
            <Th>전화번호</Th>
          </Tr>
        </Thead>

        <Tbody>
          {data.map((item) => (
            <Tr
              key={item.user_uuid}
              onClick={() => onRowClick(item)}
              _hover={{ bg: "gray.100" }}
              cursor="pointer"
            >
              <Td
                w="36px"
                px={1}
                textAlign="center"
                onClick={(e) => e.stopPropagation()}
              >
                <Checkbox
                  isChecked={!!checkedItems[item.user_uuid]}
                  onChange={() => onCheck(item.user_uuid)}
                />
              </Td>
              <Td>{item.user_name}</Td>
              <Td>{item.resident_number}</Td>
              <Td>{item.address}</Td>
              <Td>[{item.mobile_carrier}] {item.phone_number}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
