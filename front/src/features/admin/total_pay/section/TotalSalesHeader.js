import { Button, HStack, Icon } from "@chakra-ui/react";
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
}) {
  const currentMonth = getCurrentMonth();
  const changeMonth = (value) => {
    if (value) onMonthChange(value);
  };

  return (
      <HStack spacing={2} flexWrap="wrap" justify="flex-end">
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
      </HStack>
  );
}
