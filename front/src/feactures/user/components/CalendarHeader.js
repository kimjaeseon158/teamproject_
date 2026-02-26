import {
  Box,
  Button,
  IconButton,
  HStack,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";

import { useNavigate } from "react-router-dom";
import { Alarm } from "../../alarm";
import MonthPicker from "../../common/MonthPicker";

export default function CalendarHeader({
  userUuid,
  goToday,
  goToDate,
  calendarTitle, // "2026-03"
  currentMonth,
}) {
  const navigate = useNavigate();

  const isMobile = useBreakpointValue({
    base: true,
    md: false,
  });

  const handleLogout = async () => {
    try {
      await fetch("/api/user_logout/", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_uuid: userUuid }),
      });
    } finally {
      navigate("/");
    }
  };


  const handleMonthChange = (ym) => {
    const api = window.calendarRef?.getApi();
    if (api) {
      api.gotoDate(`${ym}-01`);
    }
  };
  const formatKoreanMonth = (title) => {
    if (!title) return "";

    const date = new Date(title);
    if (isNaN(date)) return title; // 변환 실패 시 원본 유지

    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    return `${year}년 ${month}월`;
  };
  return (
    <Box mb={4} w="100%">

      {isMobile ? (
        <>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Alarm />
            <Button size="sm" colorScheme="red" onClick={handleLogout}>
              로그아웃
            </Button>
          </Box>

          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            gap="12px"
          >
            <IconButton
              size="sm"
              variant="ghost"
              icon={<ChevronLeftIcon />}
              onClick={() => window.calendarRef?.getApi()?.prev()}
            />

            <MonthPicker
              value={calendarTitle}
              onChange={handleMonthChange}
            />

            <IconButton
              size="sm"
              variant="ghost"
              icon={<ChevronRightIcon />}
              onClick={() => window.calendarRef?.getApi()?.next()}
            />
          </Box>
        </>
      ) : (
        <Box position="relative">

          <Box
            position="absolute"
            right="0"
            top="0"
            display="flex"
            alignItems="center"
            gap="8px"
          >
            <Alarm />
            <Button size="sm" colorScheme="red" onClick={handleLogout}>
              로그아웃
            </Button>
          </Box>

          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            gap="10px"
          >
            <Button
              size="sm"
              variant="ghost"
              onClick={() => window.calendarRef?.getApi()?.prev()}
            >
              ◀
            </Button>

            <Text fontSize="20px" fontWeight="700" minW="150px" textAlign="center">
              {formatKoreanMonth(calendarTitle)}
            </Text>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => window.calendarRef?.getApi()?.next()}
            >
              ▶
            </Button>

            <Button size="sm" variant="outline" onClick={goToday}>
              Today
            </Button>

            <MonthPicker
              value={calendarTitle}
              onChange={handleMonthChange}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}