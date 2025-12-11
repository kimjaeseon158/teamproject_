// src/attendance/Calendar.js
import React, { useState, useEffect } from "react";
import { Box, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import MiniCalendarChakra from "./usercalender";
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

const Calendar = () => {
  const navigate = useNavigate();
  const { user, employeeNumber } = useUser();

  const [selectedDate, setSelectedDate] = useState(getTodayInfo());
  const [events] = useState([
    { title: "회의", date: "2025-01-10" },
    { title: "근태보고", date: "2025-01-12" },
  ]);

  /** 🔹 작은 캘린더 날짜 클릭 */
  const handleMiniCalendarClick = (info) => {
    if (info instanceof Date) {
      const y = info.getFullYear();
      const m = info.getMonth() + 1;
      const d = info.getDate();
      const pad = (n) => String(n).padStart(2, "0");

      setSelectedDate({
        year: y,
        month: m,
        day: d,
        formatted: `${y}-${pad(m)}-${pad(d)}`,
      });
    } else {
      setSelectedDate(info);
    }
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

  return (
    <Box display="flex" height="100vh" overflow="hidden" bg="#f5f5f7">
      {/* ░░░ LEFT DARK PANEL ░░░ */}
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

        {/* 🔥 미니 캘린더 */}
        <MiniCalendarChakra onSelect={handleMiniCalendarClick} />

        {/* 🔥 Option은 항상 고정 표시 */}
        <Box
          bg="#2c2c2e"
          p="14px"
          borderRadius="10px"
          boxShadow="0 2px 8px rgba(0,0,0,0.5)"
          mt="10px"
        >
          <Option selectedDate={selectedDate} />
        </Box>
      </Box>

      {/* ░░░ RIGHT PANEL ░░░ */}
      <Box flex="1" bg="white" display="flex" flexDirection="column" position="relative" px="20px" pt="70px">
        {/* 로그아웃 버튼 */}
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

        {/* 🔥 Custom Header Toolbar */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap="20px"
          fontSize="20px"
          fontWeight="600"
          mb={3}
        >
          {/* ◀ 이전달 */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => window.calendarRef.getApi().prev()}
          >
            ◀
          </Button>

          {/* 현재 월 타이틀 */}
          <Box id="fc-title-box"></Box>

          {/* ▶ 다음달 */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => window.calendarRef.getApi().next()}
          >
            ▶
          </Button>
        </Box>

        {/* 🔥 FullCalendar */}
        <Box flex="1" overflow="hidden">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            height="100%"
            headerToolbar={false}
            events={events}
            ref={(fc) => (window.calendarRef = fc)}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Calendar;
