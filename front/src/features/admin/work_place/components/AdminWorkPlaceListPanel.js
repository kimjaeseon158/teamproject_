import { Box, Button, Flex, Input, Text, VStack } from "@chakra-ui/react";

import { formatWon } from "../utils/rateFormat";

export default function AdminWorkPlaceListPanel({
  form,
  onNew,
  onSearchChange,
  onSelect,
  search,
  workPlaces,
}) {
  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="gray.100"
      borderRadius="xl"
      p={5}
      w={{ base: "100%", lg: "34%" }}
      minW={{ lg: "320px" }}
    >
      <Flex justify="space-between" align="center" gap={3} mb={4}>
        <Box>
          <Text fontSize="sm" fontWeight="900" color="gray.700">
            근무지 목록
          </Text>
          <Text fontSize="xs" color="gray.500">
            항목을 선택하면 오른쪽에서 수정합니다.
          </Text>
        </Box>
        <Button size="sm" colorScheme="blue" onClick={onNew}>
          추가
        </Button>
      </Flex>

      <Input
        size="sm"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="근무지 검색"
        mb={3}
      />

      <VStack align="stretch" spacing={2} maxH="420px" overflowY="auto" pr={1}>
        {workPlaces.length === 0 ? (
          <Box bg="gray.50" borderRadius="lg" p={4}>
            <Text fontSize="sm" color="gray.500">
              등록된 근무지가 없습니다.
            </Text>
          </Box>
        ) : (
          workPlaces.map((place) => {
            const selected =
              place.admin_work_place_uuid === form.admin_work_place_uuid;

            return (
              <Box
                key={place.admin_work_place_uuid}
                as="button"
                type="button"
                textAlign="left"
                border="1px solid"
                borderColor={selected ? "blue.300" : "gray.100"}
                bg={selected ? "blue.50" : "gray.50"}
                borderRadius="lg"
                p={3}
                onClick={() => onSelect(place)}
              >
                <Text fontSize="sm" fontWeight="900" color="gray.800" noOfLines={1}>
                  {place.work_place}
                </Text>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  기본 {formatWon(place.base_hourly_wage)}
                </Text>
              </Box>
            );
          })
        )}
      </VStack>
    </Box>
  );
}
