import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  HStack,
  IconButton,
  Text,
  useBreakpointValue,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon, HamburgerIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { FiBarChart2, FiLogOut } from "react-icons/fi";
import { HiOutlineMegaphone } from "react-icons/hi2";

import { Alarm } from "../../alarm";
import { useUser } from "../../auth/userContext";
import MonthPicker from "../../common/MonthPicker";
import { logoutUser } from "../api/userLogoutApi";
import StatusLegend from "./StatusLegend";

const formatKoreanMonth = (title) => {
  if (!title) return "";

  const [year, month] = title.split("-");
  return `${year}년 ${Number(month)}월`;
};

export default function CalendarHeader({
  userUuid,
  goToday,
  calendarTitle,
  setCalendarTitle,
  summary,
  hideActions = false,
  hideSummaryOnMobile = false,
  onMonthlyCompareOpen,
  comparisonLoading = false,
}) {
  const navigate = useNavigate();
  const { logout } = useUser();
  const mobileMenu = useDisclosure();
  const isMobile = useBreakpointValue({
    base: true,
    md: false,
  });

  const handleLogout = async () => {
    try {
      await logoutUser(userUuid);
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      logout({ skipRefresh: true });
      navigate("/", { replace: true });
    }
  };

  const handleMonthChange = (ym) => {
    const api = window.calendarRef?.getApi();
    if (api) api.gotoDate(`${ym}-01`);

    setCalendarTitle?.(ym);
  };

  const openBoard = () => navigate("/note");

  const runMenuAction = (action) => {
    mobileMenu.onClose();
    action?.();
  };

  return (
    <Box mb={4}>
      {isMobile ? (
        <>
          <HStack justify="space-between" mb={2}>
            {!hideActions && (
              <IconButton
                aria-label="메뉴 열기"
                size="sm"
                variant="ghost"
                icon={<HamburgerIcon boxSize={5} />}
                onClick={mobileMenu.onOpen}
              />
            )}
            {!hideSummaryOnMobile && <StatusLegend summary={summary} />}
            {!hideActions && (
              <HStack>
                <Alarm />
              </HStack>
            )}
          </HStack>

          <HStack justify="center" spacing={2} w="100%">
            <IconButton
              aria-label="이전 달"
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
              aria-label="다음 달"
              size="sm"
              variant="ghost"
              icon={<ChevronRightIcon />}
              onClick={() => window.calendarRef?.getApi()?.next()}
              minW="32px"
            />

          </HStack>

          <Drawer
            isOpen={mobileMenu.isOpen}
            placement="left"
            onClose={mobileMenu.onClose}
            size="xs"
          >
            <DrawerOverlay />
            <DrawerContent maxW="82vw">
              <DrawerHeader borderBottomWidth="1px">메뉴</DrawerHeader>
              <DrawerBody px={3} py={4}>
                <VStack align="stretch" spacing={1}>
                  <Button
                    justifyContent="flex-start"
                    leftIcon={<HiOutlineMegaphone />}
                    variant="ghost"
                    size="lg"
                    onClick={() => runMenuAction(openBoard)}
                  >
                    사내 게시판
                  </Button>
                  <Button
                    justifyContent="flex-start"
                    leftIcon={<FiBarChart2 />}
                    variant="ghost"
                    size="lg"
                    isLoading={comparisonLoading}
                    onClick={() => runMenuAction(onMonthlyCompareOpen)}
                  >
                    지난달 비교
                  </Button>
                </VStack>
              </DrawerBody>
              <DrawerFooter borderTopWidth="1px">
                <Button
                  w="100%"
                  justifyContent="flex-start"
                  leftIcon={<FiLogOut />}
                  colorScheme="red"
                  variant="ghost"
                  size="lg"
                  onClick={() => runMenuAction(handleLogout)}
                >
                  로그아웃
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </>
      ) : (
        <HStack justify="center" spacing={3} position="relative">
          <Box position="absolute" left="0">
            <StatusLegend summary={summary} />
          </Box>

          {!hideActions && (
            <HStack position="absolute" right="0" zIndex="1">
              <Alarm />
              <Button size="sm" colorScheme="blue" variant="outline" leftIcon={<HiOutlineMegaphone />} onClick={openBoard}>
                사내 게시판
              </Button>
              <Button size="sm" colorScheme="red" onClick={handleLogout}>
                로그아웃
              </Button>
            </HStack>
          )}

          <IconButton
            aria-label="이전 달"
            size="lg"
            variant="ghost"
            icon={<ChevronLeftIcon boxSize={6} />}
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
            aria-label="다음 달"
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

          <Button
            size="sm"
            colorScheme="blue"
            variant="outline"
            isLoading={comparisonLoading}
            onClick={onMonthlyCompareOpen}
          >
            지난달 비교
          </Button>
        </HStack>
      )}
    </Box>
  );
}
