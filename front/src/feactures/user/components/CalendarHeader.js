import {
  Box,
  Button,
  IconButton,
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
    if (api) api.gotoDate(`${ym}-01`);

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
        <HStack justify="center" spacing={3} position="relative">
          <HStack position="absolute" right="0" zIndex="9999">
            <Alarm />
            <Button size="sm" colorScheme="red" onClick={handleLogout}>
              로그아웃
            </Button>
          </HStack>

          <IconButton
            size="lg"
            variant="ghost"
            icon={<ChevronLeftIcon  boxSize={6}/>}
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
            size="lg"
            variant="ghost"
            icon={<ChevronRightIcon boxSize={6} />}
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
      )}
    </Box>
  );
}