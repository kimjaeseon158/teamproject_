import { Button, ButtonGroup, Flex, HStack, Text } from "@chakra-ui/react";
import { AddIcon, DeleteIcon, InfoOutlineIcon } from "@chakra-ui/icons";

export default function RateEditToolbar({
  canAddRow,
  deleting,
  onAddRow,
  onDelete,
  rateView = "current",
  onRateViewChange,
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

      <Flex gap={2} wrap="wrap" justify={{ base: "flex-start", md: "flex-end" }}>
        <ButtonGroup size="sm" isAttached variant="outline">
          <Button
            minW="112px"
            colorScheme="green"
            variant={rateView === "current" ? "solid" : "outline"}
            onClick={() => onRateViewChange?.("current")}
          >
            현재 일급
          </Button>
          <Button
            minW="120px"
            colorScheme="gray"
            bg={rateView === "ended" ? "gray.700" : "white"}
            color={rateView === "ended" ? "white" : "gray.700"}
            onClick={() => onRateViewChange?.("ended")}
          >
            종료된 일급
          </Button>
        </ButtonGroup>
        <Button
          size="sm"
          leftIcon={<AddIcon />}
          colorScheme="green"
          onClick={onAddRow}
          isDisabled={!canAddRow}
          title={!canAddRow ? "미지정 행의 수정 버튼으로 첫 현재 일급을 등록해주세요." : undefined}
        >
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
      </Flex>
    </Flex>
  );
}
