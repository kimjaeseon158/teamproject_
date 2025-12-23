// src/attendance/Calendar.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Select,
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
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import Option from "./calenderinfo";
import "../css/calender.css";
import { useUser } from "../../login/js/userContext";

// 🔹 오늘 날짜 helper
const getTodayInfo = () => {
  const today = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
    formatted: `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`,
  };
};

// 🔹 "YYYY-MM-DD" -> {year,month,day,formatted}
const toDateInfoFromStr = (dateStr) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  return { year: y, month: m, day: d, formatted: dateStr };
};

const pad2 = (n) => String(n).padStart(2, "0");

const Calendar = () => {
  const navigate = useNavigate();
  const { user, employeeNumber } = useUser();

  const [selectedDate, setSelectedDate] = useState(getTodayInfo());
  const selectedDateStr = selectedDate.formatted;

  // ✅ 월 선택 팝오버에서 사용할 연도
  const [monthPickerYear, setMonthPickerYear] = useState(selectedDate.year);

  const [events] = useState([
    { title: "회의", date: "2025-01-10" },
    { title: "근태보고", date: "2025-01-12" },
  ]);

  /** ✅ 큰 캘린더 날짜 클릭 → 선택 날짜 변경 */
  const handleBigCalendarDateClick = (info) => {
    if (!info?.dateStr) return;
    setSelectedDate(toDateInfoFromStr(info.dateStr));
  };

  /** ✅ 공통: 특정 날짜로 이동 */
  const goToDate = (dateInfo) => {
    setSelectedDate(dateInfo);
    const api = window.calendarRef?.getApi();
    if (api) api.gotoDate(dateInfo.formatted);
  };

  /** 🔹 로그아웃 */
  const handleLogout = async () => {
    const emp = employeeNumber ?? user?.employee_number ?? user?.employee_no ?? null;
    if (!emp) return alert("사원번호 없음");

    try {
      await fetch("/api/user_logout/", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ employee_number: emp }),
      });
      navigate("/");
    } catch (error) {
      console.error("logout error:", error);
    }
  };

  /** 🔹 FullCalendar 타이틀 자동 업데이트 */
  useEffect(() => {
    const timer = setInterval(() => {
      const api = window.calendarRef?.getApi();
      if (!api) return;

      const title = api.view.title;
      const dom = document.getElementById("fc-title-box");
      if (dom) dom.textContent = title;
    }, 100);

    return () => clearInterval(timer);
  }, []);

  /** ✅ 선택 날짜 하이라이트 */
  const dayCellClassNames = (arg) => {
    const d = arg.date;
    const ymd = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    return ymd === selectedDateStr ? ["selected-day-cell"] : [];
  };

  /** ✅ 팝오버: 월 클릭 시 해당 달로 이동 (그 달 1일) */
  const handlePickMonth = (m, onClose) => {
    const y = monthPickerYear;
    goToDate({
      year: y,
      month: m,
      day: 1,
      formatted: `${y}-${pad2(m)}-01`,
    });
    onClose(); // ✅ 팝오버 닫기
  };

  return (
    <Box display="flex" height="100vh" overflow="hidden" bg="#f5f5f7">
      {/* LEFT */}
      <Box
        width="350px"
        bg="#1c1c1e"
        color="white"
        p="20px"
        display="flex"
        flexDirection="column"
        gap="20px"
        overflowY="auto"
        boxShadow="2px 0 10px rgba(0,0,0,0.25)"
      >
        <Box fontSize="24px" fontWeight="800" mt="10px">
          {user?.user_name || user?.admin_id || `${user}`} 님
        </Box>

        <Box bg="#2c2c2e" p="14px" borderRadius="10px" boxShadow="0 2px 8px rgba(0,0,0,0.5)">
          <Option selectedDate={selectedDate} />
        </Box>
      </Box>

      {/* RIGHT */}
      <Box
        flex="1"
        bg="white"
        display="flex"
        flexDirection="column"
        position="relative"
        px="20px"
        pt="70px"
        minW={0}
      >
        {/* 로그아웃 */}
        <Button
          position="absolute"
          top="20px"
          right="30px"
          size="sm"
          colorScheme="red"
          zIndex={10}
          onClick={handleLogout}
        >
          로그아웃
        </Button>

        {/* 헤더 */}
        <Box display="flex" alignItems="center" justifyContent="center" gap="10px" mb={3}>
          <Button size="sm" variant="ghost" onClick={() => window.calendarRef?.getApi()?.prev()}>
            ◀
          </Button>

          <Box id="fc-title-box" fontSize="20px" fontWeight="700" />

          <Button size="sm" variant="ghost" onClick={() => window.calendarRef?.getApi()?.next()}>
            ▶
          </Button>

          {/* ✅ 버튼 아래에 뜨는 월 선택 (Windows 캘린더 느낌) */}
          <Popover placement="bottom-start" closeOnBlur>
            {({ onClose }) => (
              <>
                <PopoverTrigger>
                  <Button size="sm" leftIcon={<CalendarIcon />} variant="outline">
                    월 선택
                  </Button>
                </PopoverTrigger>

                <PopoverContent w="280px">
                  <PopoverArrow />
                  <PopoverCloseButton />
                  <PopoverHeader fontWeight="700">월 선택</PopoverHeader>

                  <PopoverBody>
                    {/* 연도 선택 라인 */}
                    <HStack justify="space-between" mb={3}>
                      <IconButton
                        aria-label="이전 연도"
                        icon={<ChevronLeftIcon />}
                        size="sm"
                        variant="ghost"
                        onClick={() => setMonthPickerYear((y) => y - 1)}
                      />
                      <Text fontWeight="800">{monthPickerYear}년</Text>
                      <IconButton
                        aria-label="다음 연도"
                        icon={<ChevronRightIcon />}
                        size="sm"
                        variant="ghost"
                        onClick={() => setMonthPickerYear((y) => y + 1)}
                      />
                    </HStack>

                    {/* 월 버튼 4x3 */}
                    <SimpleGrid columns={4} spacing={2}>
                      {Array.from({ length: 12 }).map((_, i) => {
                        const m = i + 1;
                        const isCurrent =
                          monthPickerYear === selectedDate.year && m === selectedDate.month;

                        return (
                          <Button
                            key={m}
                            size="sm"
                            variant={isCurrent ? "solid" : "outline"}
                            colorScheme={isCurrent ? "blue" : "gray"}
                            onClick={() => handlePickMonth(m, onClose)}
                          >
                            {m}월
                          </Button>
                        );
                      })}
                    </SimpleGrid>
                  </PopoverBody>
                </PopoverContent>
              </>
            )}
          </Popover>

          {/* (선택) Select도 유지하고 싶으면 여기 넣어도 됨 */}
          {/* <Select ... /> */}
        </Box>

        {/* 캘린더 */}
        <Box
          flex="1"
          minH={0}
          overflow="hidden"
          sx={{
            ".fc .fc-day-today": { background: "transparent !important" },

            /* 숫자-선 간격 */
            ".fc .fc-daygrid-day-top": {
              paddingTop: "10px",
              paddingRight: "10px",
            },

            /* 숫자 기본 여백 복구 */
            ".fc .fc-daygrid-day-number": {
              padding: "2px 4px",
              lineHeight: "1.1",
            },

            /* 선택 날짜: 숫자 동그라미 */
            ".selected-day-cell .fc-daygrid-day-number": {
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "#3182ce",
              color: "white",
              fontWeight: "700",
            },
          }}
        >
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
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
