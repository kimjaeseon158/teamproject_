import { Badge, Box, Button, Flex, Heading, HStack, Image, Text, Tooltip } from "@chakra-ui/react";
import { DownloadIcon } from "@chakra-ui/icons";

import excelIcon from "../../../../assets/img/excel.png";

export default function ApprovalPageHeader({ loading, totalCount, onExcelOpen }) {
  return (
    <Flex justify="space-between" align={{ base: "stretch", md: "center" }} direction={{ base: "column", md: "row" }} gap={4} mb={5}>
      <Box>
        <HStack spacing={3} mb={2}>
          <Heading size="lg" color="gray.900">
            승인 관리
          </Heading>
          <Badge colorScheme={loading ? "gray" : "orange"} borderRadius="full" px={3} py={1}>
            {loading ? "조회 중" : `총 ${totalCount.toLocaleString()}건`}
          </Badge>
        </HStack>
        <Text color="gray.500" fontSize="sm">
          근무 내역을 조건별로 조회하고 승인 또는 반려 처리합니다.
        </Text>
      </Box>

      <HStack spacing={2} justify={{ base: "flex-start", md: "flex-end" }}>
        <Tooltip label="승인관리 엑셀 생성" hasArrow>
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
      </HStack>
    </Flex>
  );
}
