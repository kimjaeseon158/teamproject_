import { Button, HStack, Popover, PopoverBody, PopoverCloseButton, PopoverContent, PopoverTrigger, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import { ko } from "date-fns/locale";
import { FiCalendar } from "react-icons/fi";
import "react-day-picker/dist/style.css";

import MonthPicker from "../../../common/MonthPicker";
import { toLocalDateValue } from "../../../common/utils/dateValue";

const toDate = (value) => value ? new Date(`${value}T00:00:00`) : new Date();
const toMonthValue = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

export default function WorkScheduleDatePicker({ value, onChange, isDisabled = false }) {
  const selected = toDate(value);
  const [calendarMonth, setCalendarMonth] = useState(selected);

  useEffect(() => {
    setCalendarMonth(toDate(value));
  }, [value]);

  return (
    <Popover placement="bottom-end">
      {({ onClose }) => (
        <>
          <PopoverTrigger>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<FiCalendar />}
          isDisabled={isDisabled}
        >
              {value || "날짜 선택"}
            </Button>
          </PopoverTrigger>
          <PopoverContent w="auto" p={4}>
            <PopoverCloseButton top="8px" right="8px" />
            <PopoverBody>
              <DayPicker
                mode="single"
                locale={ko}
                weekStartsOn={1}
                month={calendarMonth}
                onMonthChange={setCalendarMonth}
                selected={selected}
                onSelect={(date) => {
                  if (!date) return;
                  onChange(toLocalDateValue(date));
                  onClose();
                }}
                formatters={{
                  formatCaption: (month) => `${month.getFullYear()}년 ${month.getMonth() + 1}월`,
                }}
                components={{
                  MonthCaption: ({ calendarMonth: visibleMonth, ...props }) => (
                    <HStack {...props} justify="flex-start" spacing={3} mb={2}>
                      <Text fontSize="sm" fontWeight="800" color="gray.800">
                        {`${visibleMonth.date.getFullYear()}년 ${visibleMonth.date.getMonth() + 1}월`}
                      </Text>
                      <MonthPicker
                        value={toMonthValue(visibleMonth.date)}
                        onChange={(monthValue) => {
                          const [year, month] = monthValue.split("-").map(Number);
                          setCalendarMonth(new Date(year, month - 1, 1));
                        }}
                        size="xs"
                        width="68px"
                        borderRadius="md"
                        placement="bottom-start"
                        labelFormat="month"
                        buttonLabel="월 선택"
                      />
                    </HStack>
                  ),
                }}
              />
            </PopoverBody>
          </PopoverContent>
        </>
      )}
    </Popover>
  );
}
