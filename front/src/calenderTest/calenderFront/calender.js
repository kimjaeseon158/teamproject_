import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  SimpleGrid,
  IconButton,
  HStack,
  Text,
} from "@chakra-ui/react";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

import Option from "./calenderinfo";
import "../css/calender.css";
import { useUser } from "../../login/js/userContext";

// 🔔 알람 컴포넌트 (정상 경로)
import { Alarm } from "../../aralm";

/* ---------------- util ---------------- */

const getTodayInfo = () => {
  const today = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
    formatted: `${today.getFullYear()}-${pad(
      today.getMonth() + 1
    )}-${pad(today.getDate())}`,
  };
};

const toDateInfoFromStr = (dateStr) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  return { year: y, month: m, day: d, formatted: dateStr };
};

const pad2 = (n) => String(n).padStart(2, "0");

/* ---------------- component ---------------- */

const Calendar = () => {
  const navigate = useNavigate();
  const { userUuid, userName } = useUser(); // ✅ uuid 사용

  const [selectedDate, setSelectedDate] = useState(getTodayInfo());
  const [monthPickerYear, setMonthPickerYear] = useState(
    selectedDate.year
  );

  const events = [
    { title: "회의", date: "2025-01-10" },
    { title: "근태보고", date: "2025-01-12" },
  ];

  /* ---------- handlers ---------- */

  const handleBigCalendarDateClick = (info) => {
    if (!info?.dateStr) return;
    setSelectedDate(toDateInfoFromStr(info.dateStr));
  };

  const goToDate = (dateInfo) => {
    setSelectedDate(dateInfo);
    const api = window.calendarRef?.getApi();
    api?.gotoDate(dateInfo.formatted);
  };

  // ✅ uuid 기준 로그아웃
  const handleLogout = async () => {
    try {
      await fetch("/api/user_logout/", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_uuid: userUuid,
        }),
      });
    } catch (error) {
      console.error("logout error:", error);
    } finally {
      navigate("/");
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const api = window.calendarRef?.getApi();
      if (!api) return;
      const dom = document.getElementById("fc-title-box");
      if (dom) dom.textContent = api.view.title;
    }, 100);

    return () => clearInterval(timer);
  }, []);

  const dayCellClassNames = (arg) => {
    const d = arg.date;
    const ymd = `${d.getFullYear()}-${pad2(
      d.getMonth() + 1
    )}-${pad2(d.getDate())}`;
    return ymd === selectedDate.formatted
      ? ["selected-day-cell"]
      : [];
  };
  const handleGoToday = () => {
    const today = getTodayInfo();
    setSelectedDate(today);

    const api = window.calendarRef?.getApi();
    api?.gotoDate(today.formatted);
  };

  const handlePickMonth = (m, onClose) => {
    const y = monthPickerYear;
    goToDate({
      year: y,
      month: m,
      day: 1,
      formatted: `${y}-${pad2(m)}-01`,
    });
    onClose();
  };

  /* ---------- render ---------- */

  return (
    <Box display="flex" height="100vh" bg="#f5f5f7">
      {/* LEFT SIDEBAR */}
      <Box
        width="350px"
        bg="#1c1c1e"
        color="white"
        p="20px"
        display="flex"
        flexDirection="column"
        gap="20px"
      >
        <Box fontSize="24px" fontWeight="800">
          {userName}님
        </Box>

        <Box bg="#2c2c2e" p="14px" borderRadius="10px">
          <Option selectedDate={selectedDate} />
        </Box>
      </Box>

      {/* RIGHT CONTENT */}
      <Box
        flex="1"
        bg="white"
        display="flex"
        flexDirection="column"
        position="relative"
        px="20px"
        pt="70px"
      >
        {/* 🔔 알람 + 로그아웃 */}
        <Box
          position="absolute"
          top="20px"
          right="30px"
          display="flex"
          alignItems="center"
          gap="8px"
          zIndex={10}
        >
          <Alarm />
          <Button size="sm" colorScheme="red" onClick={handleLogout}>
            로그아웃
          </Button>
        </Box>

        {/* HEADER */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap="10px"
          mb={3}
        >
          <Button
            size="sm"
            variant="ghost"
            onClick={() => window.calendarRef?.getApi()?.prev()}
          >
            ◀
          </Button>

          <Box
            id="fc-title-box"
            fontSize="20px"
            fontWeight="700"
            minW="150px"
            textAlign="center"
          />

          <Button
            size="sm"
            variant="ghost"
            onClick={() => window.calendarRef?.getApi()?.next()}
          >
            ▶
          </Button>
          <Button size="sm" variant="outline" onClick={handleGoToday}>
            Today
          </Button>
          {/* 월 선택 */}
          <Popover placement="bottom-start">
            {({ onClose }) => (
              <>
                <PopoverTrigger>
                  <Button
                    size="sm"
                    leftIcon={<CalendarIcon />}
                    variant="outline"
                  >
                    월 선택
                  </Button>
                </PopoverTrigger>
                <PopoverContent w="280px">
                  <PopoverArrow />
                  <PopoverCloseButton />
                  <PopoverHeader fontWeight="700">
                    월 선택
                  </PopoverHeader>
                  <PopoverBody>
                    <HStack justify="space-between" mb={3}>
                      <IconButton
                        aria-label="이전 연도"
                        icon={<ChevronLeftIcon />}
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setMonthPickerYear((y) => y - 1)
                        }
                      />
                      <Text fontWeight="800">
                        {monthPickerYear}년
                      </Text>
                      <IconButton
                        aria-label="다음 연도"
                        icon={<ChevronRightIcon />}
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setMonthPickerYear((y) => y + 1)
                        }
                      />
                    </HStack>

                    <SimpleGrid columns={4} spacing={2}>
                      {Array.from({ length: 12 }).map((_, i) => (
                        <Button
                          key={i + 1}
                          size="sm"
                          onClick={() =>
                            handlePickMonth(i + 1, onClose)
                          }
                        >
                          {i + 1}월
                        </Button>
                      ))}
                    </SimpleGrid>
                  </PopoverBody>
                </PopoverContent>
              </>
            )}
          </Popover>
        </Box>

        {/* CALENDAR */}
        <Box flex="1" overflow="hidden">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            height="100%"
            headerToolbar={false}
            events={events}
            ref={(fc) => (window.calendarRef = fc)}
            dateClick={handleBigCalendarDateClick}
            dayCellClassNames={dayCellClassNames}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Calendar;
