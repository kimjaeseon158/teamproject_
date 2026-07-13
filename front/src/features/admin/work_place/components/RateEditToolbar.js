import { Button, Flex, HStack, Text } from "@chakra-ui/react";
import { AddIcon, DeleteIcon, InfoOutlineIcon } from "@chakra-ui/icons";

export default function RateEditToolbar({
  deleting,
  onAddRow,
  onDelete,
}) {
  return (
    <Flex
      justify="space-between"
      align={{ base: "stretch", md: "center" }}
      direction={{ base: "column", md: "row" }}
      gap={3}
      mb={4}
    >
      <HStack color="gray.500" fontSize="sm">
        <InfoOutlineIcon />
        <Text>
          행의 수정 아이콘을 누르면 바로 입력할 수 있고, 체크한 근무지는 삭제할 수 있습니다.
        </Text>
      </HStack>

      <HStack spacing={2}>
        <Button size="sm" leftIcon={<AddIcon />} colorScheme="green" onClick={onAddRow}>
          근무지 추가
        </Button>
        <Button
          size="sm"
          leftIcon={<DeleteIcon />}
          colorScheme="red"
          variant="outline"
          isLoading={deleting}
          onClick={onDelete}
        >
          선택 삭제
        </Button>
      </HStack>
    </Flex>
  );
}
