import { DownloadIcon } from "@chakra-ui/icons";
import { Badge, Box, Button, Flex, Heading, HStack, Icon, Tooltip } from "@chakra-ui/react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

import MonthPicker from "../../../common/MonthPicker";
import TodayButton from "../../../common/TodayButton";

const moveMonth = (value, amount) => {
  const [year, month] = value.split("-").map(Number);
  const nextDate = new Date(year, month - 1 + amount, 1);
  return `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`;
};

const getCurrentMonth = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
};

export default function TotalSalesHeader({
  apiMonth,
  onMonthChange,
  onExcelOpen,
}) {
  const currentMonth = getCurrentMonth();
  const changeMonth = (value) => {
    if (value) onMonthChange(value);
  };

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
        <Button
          aria-label="이전 달"
          variant="outline"
          size="sm"
          minW="32px"
          px={0}
          onClick={() => changeMonth(moveMonth(apiMonth, -1))}
        >
          <Icon as={FiChevronLeft} />
        </Button>
        <MonthPicker value={apiMonth} onChange={changeMonth} size="sm" />
        <Button
          aria-label="다음 달"
          variant="outline"
          size="sm"
          minW="32px"
          px={0}
          onClick={() => changeMonth(moveMonth(apiMonth, 1))}
        >
          <Icon as={FiChevronRight} />
        </Button>
        <TodayButton
          showIcon={false}
          tooltip="오늘이 포함된 달로 이동"
          isDisabled={apiMonth === currentMonth}
          onClick={() => changeMonth(currentMonth)}
        />
        <Tooltip label="Excel 생성" hasArrow>
          <Button
            leftIcon={<DownloadIcon />}
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
