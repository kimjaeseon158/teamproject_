import { DownloadIcon } from "@chakra-ui/icons";
import { Badge, Box, Button, Flex, Heading, HStack, Image, Text, Tooltip } from "@chakra-ui/react";

import excelIcon from "../../../../assets/img/excel.png";
import MonthPicker from "../../../common/MonthPicker";

export default function TotalSalesHeader({
  apiMonth,
  onMonthChange,
  onExcelOpen,
  onIncomeOpen,
  onExpenseOpen,
}) {
  return (
    <Flex
      justify="space-between"
      align={{ base: "stretch", md: "center" }}
      direction={{ base: "column", md: "row" }}
      gap={4}
      mb={3}
    >
      <Box>
        <HStack spacing={3} mb={2}>
          <Heading size="lg" color="gray.900">
            급여 현황
          </Heading>
          <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
            {apiMonth}
          </Badge>
        </HStack>
      </Box>

      <HStack spacing={2}>
        <Button colorScheme="green" variant="solid" size="sm" onClick={onIncomeOpen}>
          수입 관리
        </Button>
        <Button colorScheme="red" variant="outline" size="sm" onClick={onExpenseOpen}>
          지출 관리
        </Button>
        <MonthPicker value={apiMonth} onChange={onMonthChange} size="sm" />
        <Tooltip label="Excel 생성" hasArrow>
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
