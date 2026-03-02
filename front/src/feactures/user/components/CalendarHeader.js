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
  calendarTitle,
  setCalendarTitle,
}) {
  const navigate = useNavigate();

  const isMobile = useBreakpointValue({
    base: true,
    md: false,
  });

  const handleLogout = async () => {
    await fetch("/api/user_logout/", {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_uuid: userUuid }),
    });

    navigate("/");
  };

  const handleMonthChange = (ym) => {
    const api = window.calendarRef?.getApi();
    if (api) {
      api.gotoDate(`${ym}-01`);
    }

    setCalendarTitle?.(ym);
  };

  const formatKoreanMonth = (title) => {
    if (!title) return "";
    const [year, month] = title.split("-");
    return `${year}년 ${Number(month)}월`;
  };

  return (
    <Box mb={4}>
      {isMobile ? (
        /* ===================== 모바일 ===================== */
        <>
          <HStack justify="space-between" mb={2}>
            <Alarm />
            <Button size="xs" colorScheme="red" onClick={handleLogout}>
              로그아웃
            </Button>
          </HStack>

          <HStack justify="center" spacing={3}>
            <IconButton
              size="sm"
              variant="ghost"
              icon={<ChevronLeftIcon />}
              onClick={() => window.calendarRef?.getApi()?.prev()}
            />

            {/* 모바일은 텍스트 자체가 MonthPicker */}
            <MonthPicker
              value={calendarTitle}
              onChange={handleMonthChange}
              renderTrigger={(open) => (
                <Text
                  fontSize="md"
                  fontWeight="600"
                  cursor="pointer"
                  onClick={open}
                >
                  {formatKoreanMonth(calendarTitle)}
                </Text>
              )}
            />

            <IconButton
              size="sm"
              variant="ghost"
              icon={<ChevronRightIcon />}
              onClick={() => window.calendarRef?.getApi()?.next()}
            />
          </HStack>
        </>
      ) : (
        /* ===================== 데스크톱 ===================== */
        <HStack justify="center" spacing={3} position="relative">

          {/* 우측 상단 로그아웃 */}
          <HStack position="absolute" right="0">
            <Alarm />
            <Button size="sm" colorScheme="red" onClick={handleLogout}>
              로그아웃
            </Button>
          </HStack>

          {/* 월 이동 */}
          <IconButton
            size="sm"
            variant="ghost"
            icon={<ChevronLeftIcon />}
            onClick={() => window.calendarRef?.getApi()?.prev()}
          />

          {/* 가운데는 단순 월 표시 */}
          <Text
            fontSize="20px"
            fontWeight="700"
            minW="150px"
            textAlign="center"
          >
            {formatKoreanMonth(calendarTitle)}
          </Text>

          <IconButton
            size="sm"
            variant="ghost"
            icon={<ChevronRightIcon />}
            onClick={() => window.calendarRef?.getApi()?.next()}
          />

          {/* Today 버튼 */}
          <Button size="sm" variant="outline" onClick={goToday}>
            Today
          </Button>

          {/* 🔥 MonthPicker는 Today 옆 */}
          <MonthPicker
            value={calendarTitle}
            onChange={handleMonthChange}
          />
        </HStack>
      )}
    </Box>
  );
}