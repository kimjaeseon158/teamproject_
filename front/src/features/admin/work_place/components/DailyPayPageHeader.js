import { Badge, Box, Button, Flex, Heading, HStack, Image, Text, Tooltip } from "@chakra-ui/react";
import { DownloadIcon, RepeatIcon } from "@chakra-ui/icons";

import excelIcon from "../../../../assets/img/excel.png";

export default function DailyPayPageHeader({
  loading,
  onExcelOpen,
  onResetSearch,
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
        <Tooltip label="일급관리 엑셀 생성" hasArrow>
          <Button
            leftIcon={<DownloadIcon />}
            rightIcon={<Image src={excelIcon} w="22px" h="22px" alt="excel" />}
            colorScheme="green"
            variant="outline"
            size="sm"
            minW="92px"
            onClick={onExcelOpen}
          >
            Excel
          </Button>
        </Tooltip>
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
