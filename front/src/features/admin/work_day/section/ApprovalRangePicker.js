import {
  Box, Button, Flex, HStack, Popover, PopoverBody, PopoverCloseButton,
  PopoverContent, PopoverTrigger, Text,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { ko } from "date-fns/locale";
import "react-day-picker/dist/style.css";

import MonthPicker from "../../../common/MonthPicker";
import TodayButton from "../../../common/TodayButton";

const getDisplayMonth = (monthValue, range) => {
  if (monthValue) {
    const [year, month] = monthValue.split("-").map(Number);
    if (year && month) return new Date(year, month - 1, 1);
  }
  return range?.from || new Date();
};

export default function ApprovalRangePicker({
  range,
  setRange,
  rangeLabel,
  selectedMonth,
  onMonthChange,
  loading = false,
  placement = "bottom-end",
  ...containerProps
}) {
  const [calendarMonth, setCalendarMonth] = useState(() => getDisplayMonth(selectedMonth, range));
  const previousSelectedMonthRef = useRef(selectedMonth);

  useEffect(() => {
    if (selectedMonth && selectedMonth !== previousSelectedMonthRef.current) {
      setCalendarMonth(getDisplayMonth(selectedMonth, range));
    }
    previousSelectedMonthRef.current = selectedMonth;
  }, [selectedMonth, range]);

  const moveToCurrentMonth = () => {
    const today = new Date();
    setRange({
      from: new Date(today.getFullYear(), today.getMonth(), 1),
      to: new Date(today.getFullYear(), today.getMonth() + 1, 0),
    });
    setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  return (
    <Flex w={{ base: "100%", md: "auto" }} gap={2} {...containerProps}>
      <Box flex={{ base: 1, md: "initial" }} minW={0}>
        <Popover placement={placement}>
          <PopoverTrigger>
            <Button size="sm" variant="outline" w={{ base: "100%", md: "auto" }} isDisabled={loading}>
              {rangeLabel}
            </Button>
          </PopoverTrigger>
          <PopoverContent w="auto" maxW="calc(100vw - 24px)" p={{ base: 2, md: 4 }}>
            <PopoverCloseButton top="8px" right="8px" />
            <PopoverBody>
              <DayPicker
                mode="range"
                locale={ko}
                weekStartsOn={1}
                formatters={{
                  formatCaption: (month) => `${month.getFullYear()}년 ${month.getMonth() + 1}월`,
                }}
                month={calendarMonth}
                onMonthChange={setCalendarMonth}
                selected={range}
                onSelect={setRange}
                components={{
                  MonthCaption: ({ calendarMonth: visibleMonth, ...props }) => (
                    <HStack {...props} justify="flex-start" spacing={3} mb={2}>
                      <Text fontSize="sm" fontWeight="800" color="gray.800">
                        {`${visibleMonth.date.getFullYear()}년 ${visibleMonth.date.getMonth() + 1}월`}
                      </Text>
                      <MonthPicker
                        value={selectedMonth}
                        onChange={onMonthChange}
                        size="xs"
                        width="68px"
                        borderRadius="md"
                        placement="bottom-start"
                        buttonLabel="월 선택"
                      />
                    </HStack>
                  ),
                }}
              />
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </Box>
      <TodayButton
        showIcon={false}
        tooltip="이번 달 전체 기간 선택"
        isDisabled={loading}
        onClick={moveToCurrentMonth}
      />
    </Flex>
  );
}
