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
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import Option from "./calenderinfo";
import "../css/calender.css";
import { useUser } from "../../login/js/userContext";

// ✅ 알람 컴포넌트 임포트
import Alarm from "../../alarm"; 

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
  const [monthPickerYear, setMonthPickerYear] = useState(selectedDate.year);

  const [events] = useState([
    { title: "회의", date: "2025-01-10" },
    { title: "근태보고", date: "2025-01-12" },
  ]);

  const handleBigCalendarDateClick = (info) => {
    if (!info?.dateStr) return;
    setSelectedDate(toDateInfoFromStr(info.dateStr));
  };

  const goToDate = (dateInfo) => {
    setSelectedDate(dateInfo);
    const api = window.calendarRef?.getApi();
    if (api) api.gotoDate(dateInfo.formatted);
  };

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

  const dayCellClassNames = (arg) => {
    const d = arg.date;
    const ymd = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    return ymd === selectedDateStr ? ["selected-day-cell"] : [];
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

  return (
    <Box display="flex" height="100vh" overflow="hidden" bg="#f5f5f7">
      {/* LEFT SIDEBAR */}
      <Box width="350px" bg="#1c1c1e" color="white" p="20px" display="flex" flexDirection="column" gap="20px" overflowY="auto">
        <Box fontSize="24px" fontWeight="800" mt="10px">
          {user?.user_name || user?.admin_id || `${user}`} 님
        </Box>
        <Box bg="#2c2c2e" p="14px" borderRadius="10px">
          <Option selectedDate={selectedDate} />
        </Box>
      </Box>

      {/* RIGHT CONTENT */}
      <Box flex="1" bg="white" display="flex" flexDirection="column" position="relative" px="20px" pt="70px" minW={0}>
        
        {/* 로그아웃 버튼 (우측 상단 고정) */}
        <Button position="absolute" top="20px" right="30px" size="sm" colorScheme="red" zIndex={10} onClick={handleLogout}>
          로그아웃
        </Button>

        {/* 🔹 헤더 영역 (중앙 정렬) */}
        <Box display="flex" alignItems="center" justifyContent="center" gap="10px" mb={3}>
          <Button size="sm" variant="ghost" onClick={() => window.calendarRef?.getApi()?.prev()}>◀</Button>
          <Box id="fc-title-box" fontSize="20px" fontWeight="700" minW="150px" textAlign="center" />
          <Button size="sm" variant="ghost" onClick={() => window.calendarRef?.getApi()?.next()}>▶</Button>

          {/* 월 선택 Popover */}
          <Popover placement="bottom-start" closeOnBlur>
            {({ onClose }) => (
              <>
                <PopoverTrigger>
                  <Button size="sm" leftIcon={<CalendarIcon />} variant="outline">월 선택</Button>
                </PopoverTrigger>
                <PopoverContent w="280px">
                  <PopoverArrow />
                  <PopoverCloseButton />
                  <PopoverHeader fontWeight="700">월 선택</PopoverHeader>
                  <PopoverBody>
                    <HStack justify="space-between" mb={3}>
                      <IconButton aria-label="이전 연도" icon={<ChevronLeftIcon />} size="sm" variant="ghost" onClick={() => setMonthPickerYear(y => y-1)} />
                      <Text fontWeight="800">{monthPickerYear}년</Text>
                      <IconButton aria-label="다음 연도" icon={<ChevronRightIcon />} size="sm" variant="ghost" onClick={() => setMonthPickerYear(y => y+1)} />
                    </HStack>
                    <SimpleGrid columns={4} spacing={2}>
                      {Array.from({ length: 12 }).map((_, i) => (
                        <Button key={i+1} size="sm" variant={monthPickerYear === selectedDate.year && (i+1) === selectedDate.month ? "solid" : "outline"} 
                          colorScheme={monthPickerYear === selectedDate.year && (i+1) === selectedDate.month ? "blue" : "gray"}
                          onClick={() => handlePickMonth(i+1, onClose)}
                        >
                          {i+1}월
                        </Button>
                      ))}
                    </SimpleGrid>
                  </PopoverBody>
                </PopoverContent>
              </>
            )}
          </Popover>
          <Alarm /> 
        </Box>

        {/* 캘린더 본체 */}
        <Box flex="1" minH={0} overflow="hidden" sx={{
          ".fc .fc-day-today": { background: "transparent !important" },
          ".selected-day-cell .fc-daygrid-day-number": {
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: "28px", height: "28px", borderRadius: "50%",
            background: "#3182ce", color: "white", fontWeight: "700",
          },
        }}>
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