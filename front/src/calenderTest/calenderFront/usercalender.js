// src/attendance/Calendar.js
import React, { useState } from "react";
import { Box, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import Option from "./calenderinfo";
import "../css/calender.css";
import { useUser } from "../../login/js/userContext";

const Calendar = () => {
  const navigate = useNavigate();
  const { user, employeeNumber } = useUser();

  const [selectedDate, setSelectedDate] = useState(null);
  const [showOption, setShowOption] = useState(false);

  const [events, setEvents] = useState([
    { title: "회의", date: "2025-01-10" },
    { title: "근태보고", date: "2025-01-12" }
  ]);

  /** 🔥 FullCalendar 날짜 클릭 시 실행 */
  const handleDateClick = (e) => {
    const date = e.date;
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();

    const pad = (n) => String(n).padStart(2, "0");

    setSelectedDate({
      year: y,
      month: m,
      day: d,
      formatted: `${y}-${pad(m)}-${pad(d)}`
    });

    setShowOption(true);
  };

  /** 🔥 로그아웃 함수 (기존 유지) */
  const handleLogout = async () => {
    const employeeNo = employeeNumber ?? user?.employee_number ?? null;
    if (!employeeNo) return alert("사원번호가 없어 로그아웃 불가");

    try {
      const response = await fetch("/api/user_logout/", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ employee_number: employeeNo }),
      });

      if (!response.ok) throw new Error("Logout failed");
      navigate("/");

    } catch (error) {
      alert("Logout error");
    }
  };

  return (
    <Box position="relative" className="calenderbk">

      {/* 🔥 우측 상단 로그아웃 버튼 유지 */}
      <Button
        position="absolute"
        top="10px"
        right="20px"
        colorScheme="red"
        onClick={handleLogout}
        size="sm"
      >
        로그아웃
      </Button>

      {/* 🔹 사용자 이름 표시 */}
      <div className="calender_sub">
        <h2>{user?.user_name || user?.admin_id || "사용자"}님</h2>
      </div>

      {/* 📅 FullCalendar 메인 화면 */}
      <div style={{ width: "95%", margin: "0 auto", paddingTop: "15px" }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            start: "prev,next today",
            center: "title",
            end: "dayGridMonth,timeGridWeek,timeGridDay"
          }}
          dateClick={handleDateClick}
          events={events}
          height="80vh"
        />
      </div>

      {/* 🔥 날짜 클릭 시 기존 Option UI 그대로 뜸 */}
      {showOption && <Option selectedDate={selectedDate} />}
    </Box>
  );
};

export default Calendar;
