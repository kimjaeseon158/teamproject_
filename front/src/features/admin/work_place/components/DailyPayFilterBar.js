import { Box, Button, Flex, Input, Select } from "@chakra-ui/react";

export default function DailyPayFilterBar({
  adminWorkPlaces,
  loading,
  searchUserName,
  searchWorkPlace,
  workPlacesLoading,
  onSearch,
  onUserNameChange,
  onWorkPlaceChange,
}) {
  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="gray.100"
      borderRadius="lg"
      boxShadow="sm"
      px={{ base: 4, md: 6 }}
      py={4}
      mb={6}
    >
      <Flex gap={3} align="center" justify="flex-start" wrap="wrap">
        <Input
          size="sm"
          w={{ base: "100%", md: "170px" }}
          placeholder="직원명 검색"
          value={searchUserName}
          onChange={(e) => onUserNameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSearch();
          }}
        />
        <Select
          size="sm"
          w={{ base: "100%", md: "220px" }}
          value={searchWorkPlace}
          onChange={(e) => onWorkPlaceChange(e.target.value)}
          isDisabled={workPlacesLoading}
        >
          <option value="">근무지 전체</option>
          {adminWorkPlaces.map((place) => (
            <option key={place.admin_work_place_uuid} value={place.work_place}>
              {place.work_place}
            </option>
          ))}
        </Select>
        <Button
          colorScheme="blue"
          size="sm"
          onClick={onSearch}
          isLoading={loading}
        >
          조회
        </Button>
      </Flex>
    </Box>
  );
}
