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
}) {
  const navigate = useNavigate();

  const isMobile = useBreakpointValue({
    base: true,
    md: false,
  });
  const handleLogout = async () => {
    console.log("로그아웃 userUuid:", userUuid);
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

  /* 🔥 브라우저 안전 포맷 */
  const formatKoreanMonth = (title) => {
    if (!title) return "";

    const [year, month] = title.split("-");
    return `${year}년 ${Number(month)}월`;
  };

  return (
    <Box mb={4} w="100%">
      {isMobile ? (
        <>
          <HStack justify="space-between" mb={2}>
            <Alarm />
            <Button size="xs" colorScheme="red" onClick={handleLogout}>
              로그아웃
            </Button>
          </HStack>

          <Box
            bg="gray.50"
            borderRadius="14px"
            py={3}
            px={4}
            boxShadow="sm"
          >
            <HStack justify="space-between">
              <IconButton
                size="sm"
                variant="ghost"
                icon={<ChevronLeftIcon />}
                onClick={() => window.calendarRef?.getApi()?.prev()}
              />

              <MonthPicker
                value={calendarTitle}
                onChange={handleMonthChange}
                renderTrigger={(open) => (
                  <Text
                    fontSize="md"
                    fontWeight="600"
                    onClick={open}
                    cursor="pointer"
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
          </Box>
        </>
      ) : (
        <Box position="relative">

          <HStack
            position="absolute"
            right="0"
            top="0"
            spacing={2}
          >
            <Alarm />
            <Button size="sm" colorScheme="red" onClick={handleLogout}>
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

            <Button size="sm" variant="outline" onClick={goToday}>
              Today
            </Button>

            <MonthPicker
              value={calendarTitle}
              onChange={handleMonthChange}
            />
          </HStack>
        </Box>
      )}
    </Box>
  );
}