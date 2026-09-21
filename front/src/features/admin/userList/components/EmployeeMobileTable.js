import { Avatar, Box, Button, Checkbox, Flex, Input, Text } from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { useState } from "react";

export default function EmployeeMobileTable({
  peopleData,
  checkedItems,
  onCheck,
  selectAll,
  selectedCount,
  onOpenPerson,
  totalCount,
}) {
  const [query, setQuery] = useState("");
  const people = peopleData.filter((person) => `${person.user_name || ""} ${person.phone_number || ""}`.includes(query.trim()));
  return <Box bg="white">
    <Input aria-label="직원 이름 또는 전화번호 검색" placeholder="이름 또는 전화번호 검색" value={query} onChange={(e) => setQuery(e.target.value)} mb={4} bg="gray.50" />
    <Flex justify="space-between" align="center" py={3} borderBottomWidth="1px" borderColor="gray.100">
      <Checkbox colorScheme="teal" isChecked={selectAll.isChecked} isIndeterminate={selectAll.isIndeterminate} isDisabled={selectAll.isDisabled} onChange={(e) => selectAll.onChange(e.target.checked)}>전체 선택</Checkbox>
      <Text fontSize="sm" color="gray.500">{selectedCount > 0 ? `${selectedCount}명 선택 · ` : ""}전체 <Box as="span" color="teal.600" fontWeight="700">{totalCount}명</Box></Text>
    </Flex>
    {!people.length && <Text py={16} textAlign="center" color="gray.500">검색된 직원이 없습니다.</Text>}
    {people.map((person) => <Flex key={person.user_uuid} gap={2} py={4} align="center" borderBottomWidth="1px" borderColor="gray.100" bg={checkedItems[person.user_uuid] ? "teal.50" : "white"}>
      <Checkbox p={1} colorScheme="teal" aria-label={`${person.user_name} 선택`} isChecked={!!checkedItems[person.user_uuid]} onChange={() => onCheck(person.user_uuid)} />
      <Button variant="unstyled" h="auto" flex={1} minW={0} whiteSpace="normal" onClick={() => onOpenPerson(person)} aria-label={`${person.user_name} 직원 상세`}>
        <Flex gap={3} align="center" textAlign="left"><Avatar size="sm" name={person.user_name} bg="teal.50" color="teal.700" /><Box flex={1} minW={0}><Text fontWeight="700" overflowWrap="anywhere">{person.user_name}</Text><Text mt={1} fontSize="sm" fontWeight="400" color="gray.500">{person.phone_number || "연락처 미등록"}</Text></Box><ChevronRightIcon color="gray.400" boxSize={5} /></Flex>
      </Button>
    </Flex>)}
  </Box>;
}
