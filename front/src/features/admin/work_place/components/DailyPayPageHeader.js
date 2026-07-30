import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Image,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react";
import {
  ChevronDownIcon,
  DownloadIcon,
  RepeatIcon,
  SmallAddIcon,
} from "@chakra-ui/icons";

import excelIcon from "../../../../assets/img/excel.png";

export default function DailyPayPageHeader({
  loading,
  onExcelOpen,
  onResetSearch,
  onWorkplaceAssignmentOpen,
}) {
  return (
    <Flex
      justify="space-between"
      align={{ base: "stretch", md: "center" }}
      direction={{ base: "column", md: "row" }}
      gap={4}
      mb={6}
    >
      <Box>
        <HStack spacing={3} mb={2}>
          <Heading size="lg" color="gray.800">
            일급 관리
          </Heading>
          <Badge colorScheme="green" borderRadius="full" px={3} py={1}>
            {loading ? "불러오는 중" : "최신 데이터"}
          </Badge>
        </HStack>
        <Text color="gray.500" fontSize="sm">
          직원별 근무지 일급 평균을 확인하고 수정합니다.
        </Text>
      </Box>

      <HStack spacing={2} justify={{ base: "flex-start", md: "flex-end" }}>
        <Menu placement="bottom-end">
          <MenuButton
            as={Button}
            rightIcon={<ChevronDownIcon />}
            colorScheme="green"
            size="sm"
            minW="112px"
          >
            <HStack spacing={2} justify="center">
              <Text>Excel</Text>
              <Image src={excelIcon} w="18px" h="18px" alt="excel" />
            </HStack>
          </MenuButton>
          <MenuList minW="250px" p={2} borderColor="gray.200" boxShadow="xl">
            <MenuGroup title="일급 관리">
              <MenuItem
                icon={<SmallAddIcon />}
                borderRadius="md"
                fontSize="sm"
                fontWeight="700"
                onClick={onExcelOpen}
              >
                일급 엑셀 업로드
              </MenuItem>
            </MenuGroup>
            <MenuDivider />
            <MenuGroup title="날짜별 근무표">
              <MenuItem
                icon={<DownloadIcon />}
                borderRadius="md"
                fontSize="sm"
                fontWeight="700"
                onClick={onWorkplaceAssignmentOpen}
              >
                근무표 업로드·관리
              </MenuItem>
              <MenuItem
                icon={<SmallAddIcon />}
                borderRadius="md"
                bg="green.50"
                color="green.700"
                fontSize="sm"
                fontWeight="800"
                onClick={onWorkplaceAssignmentOpen}
                _hover={{ bg: "green.100" }}
              >
                원본 다운로드·교체
              </MenuItem>
            </MenuGroup>
          </MenuList>
        </Menu>

        <Button
          leftIcon={<RepeatIcon />}
          variant="outline"
          size="sm"
          onClick={onResetSearch}
          isLoading={loading}
        >
          전체보기
        </Button>
      </HStack>
    </Flex>
  );
}
