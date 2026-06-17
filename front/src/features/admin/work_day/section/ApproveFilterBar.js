import {
  Flex,
  Select,
  Button,
  Input,
  Box,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverCloseButton,
  Text,
  HStack,
} from "@chakra-ui/react";
import { DayPicker } from "react-day-picker";
import { ko } from "date-fns/locale";
import { useEffect, useRef, useState } from "react";
import "react-day-picker/dist/style.css";
import locationsList from "../../../common/work_placeColumns/locationsList";
import MonthPicker from "../../../common/MonthPicker";
import { EXTRA_WORK_TYPES } from "../../../common/workTypes";

const getDisplayMonth = (monthValue, range) => {
  if (monthValue) {
    const [year, month] = monthValue.split("-").map(Number);
    if (year && month) return new Date(year, month - 1, 1);
  }

  return range?.from || new Date();
};

export default function ApproveFilterBar({
  status,
  setStatus,
  workPlace,
  setWorkPlace,
  workType,
  setWorkType,
  userName,
  setUserName,
  extraWork,
  setExtraWork,
  range,
  setRange,
  rangeLabel,
  selectedMonth,
  onMonthChange,
  onRangeReset,
  onReset,
  onSearch,
  loading,
}) {
  const [calendarMonth, setCalendarMonth] = useState(() =>
    getDisplayMonth(selectedMonth, range)
  );
  const previousSelectedMonthRef = useRef(selectedMonth);

  const handleTodayClick = () => {
    const today = new Date();
    setRange({ from: today, to: today });
    setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  useEffect(() => {
    if (selectedMonth && selectedMonth !== previousSelectedMonthRef.current) {
      setCalendarMonth(getDisplayMonth(selectedMonth, range));
    }

    previousSelectedMonthRef.current = selectedMonth;
  }, [selectedMonth, range]);

  return (
    <Flex gap={3} align="center" wrap="wrap">
      <Select
        size="sm"
        w={{ base: "100%", md: "150px" }}
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        isDisabled={loading}
      >
        <option value="전체">전체</option>
        <option value="승인">승인</option>
        <option value="대기">대기</option>
        <option value="거절">거절</option>
      </Select>

      <Select
        size="sm"
        w={{ base: "100%", md: "220px" }}
        value={workPlace}
        onChange={(e) => setWorkPlace(e.target.value)}
        isDisabled={loading}
      >
        <option value="">근무지 전체</option>
        <option value="__NULL__">근무지 미지정</option>
        {locationsList.map((loc) => (
          <option key={loc} value={loc}>
            {loc}
          </option>
        ))}
      </Select>

      <Select
        size="sm"
        w={{ base: "100%", md: "160px" }}
        value={workType}
        onChange={(e) => setWorkType(e.target.value)}
        isDisabled={loading}
      >
        <option value="">근무구분 전체</option>
        <option value="주간">주간</option>
        <option value="야간">야간</option>
        <option value="특근">특근</option>
        <option value="__NULL__">근무구분 미지정</option>
      </Select>

      <Select
        size="sm"
        w={{ base: "100%", md: "170px" }}
        value={extraWork}
        onChange={(e) => setExtraWork(e.target.value)}
        isDisabled={loading}
      >
        <option value="">추가근무 전체</option>
        {EXTRA_WORK_TYPES.map((type) => (
          <option key={type.value} value={type.submitLabel}>
            {type.label}
          </option>
        ))}
      </Select>

      <Input
        size="sm"
        w={{ base: "100%", md: "170px" }}
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        placeholder="직원명 검색"
        isDisabled={loading}
      />

      <Button
        size="sm"
        colorScheme="blue"
        onClick={onSearch}
        isLoading={loading}
      >
        조회
      </Button>

      <Button size="sm" variant="outline" onClick={onReset} isDisabled={loading}>
        초기화
      </Button>

      <Box ml={{ base: 0, md: "auto" }} w={{ base: "100%", md: "auto" }}>
        <Popover placement="bottom-end">
          <PopoverTrigger>
            <Button size="sm" variant="outline" w={{ base: "100%", md: "auto" }}>
              {rangeLabel}
            </Button>
          </PopoverTrigger>

          <PopoverContent w="auto" p={4}>
            {/* 🔥 Arrow 제거해서 겹침 해결 */}
            <PopoverCloseButton top="8px" right="8px" />

            <PopoverBody>
              <DayPicker
                mode="range"
                locale={ko}
                weekStartsOn={1}
                formatters={{
                  formatCaption: (month) =>
                    `${month.getFullYear()}년 ${month.getMonth() + 1}월`,
                }}
                month={calendarMonth}
                onMonthChange={setCalendarMonth}
                selected={range}
                onSelect={setRange}
                components={{
                  MonthCaption: ({ calendarMonth, ...props }) => (
                    <HStack {...props} justify="flex-start" spacing={3} mb={2}>
                      <Text fontSize="sm" fontWeight="800" color="gray.800">
                        {`${calendarMonth.date.getFullYear()}년 ${calendarMonth.date.getMonth() + 1}월`}
                      </Text>
                      <MonthPicker
                        value={selectedMonth}
                        onChange={onMonthChange}
                        size="xs"
                        width="68px"
                        borderRadius="md"
                        placement="bottom-start"
                        placeholder="월선택"
                        labelFormat="month"
                        buttonLabel="월선택"
                      />
                    </HStack>
                  ),
                }}
              />

              {/* 🔥 Today 버튼 */}
              <HStack mt={4} justify="space-between">
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={handleTodayClick}
                >
                  오늘
                </Button>

                <Button
                  size="xs"
                  variant="ghost"
                  onClick={onRangeReset}
                >
                  초기화
                </Button>
              </HStack>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </Box>
    </Flex>
  );
}
