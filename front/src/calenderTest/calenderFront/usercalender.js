// src/attendance/usercalender.js
import React, { useState } from "react";
import {
  Box,
  Flex,
  Text,
  IconButton,
  Grid,
  GridItem,
  useColorModeValue,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";

const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

export default function MiniCalendarChakra({ onSelect = () => {} }) {
  const today = new Date();

  // ✅ 처음 month, selectedDate 둘 다 오늘로
  const [current, setCurrent] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);

  const bgSelected = useColorModeValue("#0a84ff", "#0a84ff");

  const year = current.getFullYear();
  const month = current.getMonth(); // 0~11

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  const rawCells = firstDay + lastDate;
  const totalCells = rawCells <= 35 ? 35 : 42;

  const prevMonthDate = new Date(year, month, 0);
  const prevMonthLastDate = prevMonthDate.getDate();
  const prevYear = prevMonthDate.getFullYear();
  const prevMonth = prevMonthDate.getMonth();

  const nextMonthDate = new Date(year, month + 1, 1);
  const nextYear = nextMonthDate.getFullYear();
  const nextMonth = nextMonthDate.getMonth();

  const days = [];

  // 이전 달
  for (let i = firstDay - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDate - i;
    days.push({
      date: new Date(prevYear, prevMonth, dayNum),
      inCurrentMonth: false,
    });
  }

  // 이번 달
  for (let d = 1; d <= lastDate; d++) {
    days.push({
      date: new Date(year, month, d),
      inCurrentMonth: true,
    });
  }

  // 다음 달
  const remaining = totalCells - days.length;
  for (let d = 1; d <= remaining; d++) {
    days.push({
      date: new Date(nextYear, nextMonth, d),
      inCurrentMonth: false,
    });
  }

  const handlePrev = () => {
    setCurrent(new Date(year, month - 1, 1));
  };

  const handleNext = () => {
    setCurrent(new Date(year, month + 1, 1));
  };

  const isSameDate = (d1, d2) => {
    if (!d1 || !d2) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const handleSelect = (dateObj) => {
    setSelectedDate(dateObj);
    setCurrent(new Date(dateObj.getFullYear(), dateObj.getMonth(), 1));

    const y = dateObj.getFullYear();
    const m = dateObj.getMonth() + 1;
    const d = dateObj.getDate();
    const pad = (n) => String(n).padStart(2, "0");

    onSelect({
      year: y,
      month: m,
      day: d,
      formatted: `${y}-${pad(m)}-${pad(d)}`,
    });
  };

  return (
    <Box
      bg="#2c2c2e"
      color="#f2f2f7"
      p={4}
      borderRadius="10px"
      boxShadow="0 2px 8px rgba(0,0,0,0.6)"
      userSelect="none"
    >
      {/* 상단 헤더 */}
      <Flex justify="space-between" align="center" mb={2}>
        <IconButton
          size="sm"
          icon={<ChevronLeftIcon />}
          onClick={handlePrev}
          aria-label="prev-month"
          variant="ghost"
          colorScheme="whiteAlpha"
        />
        <Text fontWeight="bold">
          {year}년 {month + 1}월
        </Text>
        <IconButton
          size="sm"
          icon={<ChevronRightIcon />}
          onClick={handleNext}
          aria-label="next-month"
          variant="ghost"
          colorScheme="whiteAlpha"
        />
      </Flex>

      {/* 요일 */}
      <Grid templateColumns="repeat(7, 1fr)" textAlign="center" mb={2}>
        {weekDays.map((day, idx) => (
          <Text
            key={idx}
            fontWeight="600"
            color="#a1a1aa"
            fontSize="xs"
          >
            {day}
          </Text>
        ))}
      </Grid>

      {/* 날짜들 */}
      <Grid templateColumns="repeat(7, 1fr)" gap={1}>
        {days.map((item, idx) => {
          const date = item.date;
          const dayNum = date.getDate();
          const isSelected = isSameDate(selectedDate, date);

          return (
            <GridItem
              key={idx}
              h="34px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
              onClick={() => handleSelect(date)}
            >
              <Flex
                w="26px"
                h="26px"
                borderRadius="50%"
                align="center"
                justify="center"
                fontSize="sm"
                fontWeight={isSelected ? "700" : "500"}
                bg={isSelected ? bgSelected : "transparent"}
                color={
                  isSelected
                    ? "white"
                    : item.inCurrentMonth
                    ? "#f9fafb"
                    : "#6b7280"
                }
                _hover={{
                  bg: isSelected ? bgSelected : "rgba(255,255,255,0.08)",
                }}
              >
                {dayNum}
              </Flex>
            </GridItem>
          );
        })}
      </Grid>
    </Box>
  );
}
