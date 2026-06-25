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
import { useUser } from "../../auth/userContext";
import { Alarm } from "../../alarm";
import MonthPicker from "../../common/MonthPicker";
import StatusLegend from "./StatusLegend";

export default function CalendarHeader({
  userUuid,
  goToday,
  calendarTitle,
  setCalendarTitle,
  summary,
  hideSummaryOnMobile = false,
}) {
  const navigate = useNavigate();
  const { logout } = useUser();

  const isMobile = useBreakpointValue({
    base: true,
    md: false,
  });

  const handleLogout = async () => {
    try {
      await fetch("/api/user-logout/", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_uuid: userUuid }),
      });
    } catch (err) {
      console.error("Logout failed");
    } finally {
      logout();
      navigate("/", { replace: true });
    }
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
            {!hideSummaryOnMobile && <StatusLegend summary={summary} />}
            <HStack flex={hideSummaryOnMobile ? 1 : undefined} justify={hideSummaryOnMobile ? "flex-end" : undefined}>
              <Alarm />
              <Button size="xs" colorScheme="red" onClick={handleLogout}>
                濡쒓렇?꾩썐
              </Button>
            </HStack>
          </HStack>

          <HStack justify="center" spacing={2} w="100%">
            <IconButton
              size="sm" 
              variant="ghost"
              icon={<ChevronLeftIcon />}
              onClick={() => window.calendarRef?.getApi()?.prev()}
              minW="32px"
            />

            <MonthPicker
              value={calendarTitle}
              onChange={handleMonthChange}
              onToday={goToday}
              showToday
              size="sm"
              variant="outline"
              borderRadius="xl"
              width="128px"
              placement="bottom"
            />

            <IconButton
              size="sm"
              variant="ghost"
              icon={<ChevronRightIcon />}
              onClick={() => window.calendarRef?.getApi()?.next()}
              minW="32px"
            />
          </HStack>
        </>
      ) : (
        <HStack justify="center" spacing={3} position="relative">
          <Box position="absolute" left="0">
            <StatusLegend summary={summary} />
          </Box>

          <HStack position="absolute" right="0" zIndex="9999">
            <Alarm />
            <Button size="sm" colorScheme="red" onClick={handleLogout}>
              濡쒓렇?꾩썐
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

          <Button size="sm" variant="outline" borderRadius="xl" onClick={goToday}>
            Today
          </Button>

          <MonthPicker
            value={calendarTitle}
            onChange={handleMonthChange}
            size="sm"
            variant="outline"
            borderRadius="xl"
          />
        </HStack>
      )}
    </Box>
  );
}
