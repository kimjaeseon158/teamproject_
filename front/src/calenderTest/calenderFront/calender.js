// src/attendance/Calendar.js
import React, { useState } from "react";
import { Box, VStack, Text, Divider } from "@chakra-ui/react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Calendar as MiniCalendar } from "react-calendar"; 
import "react-calendar/dist/Calendar.css";

import "../css/calender.css";
import { useUser } from "../../login/js/userContext";
import Option from "./calenderinfo";

const Calendar = () => {
  const { user } = useUser();

  const [selectedDate, setSelectedDate] = useState(null);
  const [showOption, setShowOption] = useState(false);

  const [events] = useState([
    { title: "회의", date: "2025-01-10", icon:"📌" },
    { title: "근태보고", date: "2025-01-12", icon:"📝" }
  ]);

  const handleDateClick = (e) => {
    const y = e.date.getFullYear();
    const m = e.date.getMonth() + 1;
    const d = e.date.getDate();
    const pad = n => String(n).padStart(2,"0");

    setSelectedDate({
      year:y, month:m, day:d,
      formatted:`${y}-${pad(m)}-${pad(d)}`
    });

    setShowOption(true);
  };

  return (
    <div className="calenderbk">
      
      {/* 🔥 Left Side - Mini Calendar + Event List */}
      <div className="calender_sub">
        <h2 style={{ marginBottom:"15px", fontSize:"20px", fontWeight:"bold" ,fontcolor:'black' }}>
          {user?.user_name || user?.admin_id} 님의 캘린더
        </h2>

        {/* 미니 캘린더 */}
        <MiniCalendar
          onChange={setSelectedDate}
          className="mini_calendar"
        />

        <Divider borderColor="gray.500" w="80%" mt="20px" mb="10px"/>

        <Text fontSize="16px" fontWeight="bold" mb="10px">📅 일정 목록</Text>

        <VStack spacing="10px" w="100%" align="center">
          {events.map((e,i)=>(
            <div key={i} className="event_list_box">
              <div className="event_title">{e.icon} {e.title}</div>
              <div className="event_date">{e.date}</div>
            </div>
          ))}
        </VStack>
      </div>

      {/* 🔥 Right Side - Main Calendar */}
      <div className="calendar_main">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            start:"today prev,next",
            center:"title",
            end:"dayGridMonth,timeGridWeek,timeGridDay"
          }}
          height="100vh"
          events={events}
          dateClick={handleDateClick}
        />
      </div>

      {showOption && <Option selectedDate={selectedDate} />}
    </div>
  );
};

export default Calendar;
