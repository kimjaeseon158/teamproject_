import { Box, Button, Flex, Input, SimpleGrid, Text } from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";

import { RATE_FIELDS } from "../constants/rateFields";

export default function AdminWorkPlaceFormPanel({
  deleting,
  form,
  isEditMode,
  onChange,
  onDelete,
}) {
  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="gray.100"
      borderRadius="xl"
      p={5}
      flex="1"
      minW={0}
    >
      <Flex justify="space-between" align="center" gap={3} mb={4}>
        <Box>
          <Text fontSize="sm" fontWeight="900" color="gray.700">
            {isEditMode ? "근무지 수정" : "근무지 추가"}
          </Text>
          <Text fontSize="xs" color="gray.500">
            저장한 값은 직원별 시급 등록 모달에 반영됩니다.
          </Text>
        </Box>
        {isEditMode && (
          <Button
            size="sm"
            colorScheme="red"
            variant="outline"
            leftIcon={<DeleteIcon />}
            onClick={onDelete}
            isLoading={deleting}
          >
            삭제
          </Button>
        )}
      </Flex>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={5} minW={0}>
        <Box gridColumn={{ base: "auto", lg: "1 / -1" }} minW={0}>
          <Text fontSize="xs" fontWeight="800" color="gray.500" mb={1}>
            근무지명
          </Text>
          <Input
            w="100%"
            value={form.work_place}
            onChange={(e) => onChange("work_place", e.target.value)}
            placeholder="예: 삼성전자(천안)"
          />
        </Box>
        {RATE_FIELDS.map((field) => (
          <Box key={field.key} minW={0}>
            <Text fontSize="xs" fontWeight="800" color="gray.500" mb={1}>
              {field.label}
            </Text>
            <Input
              w="100%"
              type="number"
              value={form[field.key]}
              onChange={(e) => onChange(field.key, e.target.value)}
              placeholder="금액 입력"
            />
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}
