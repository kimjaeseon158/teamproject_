// src/attendance/Calendar.js (경로는 너 프로젝트 구조에 맞게)
import React, { useState } from "react";
import { subMonths, addMonths } from "date-fns";
import { Box, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import Option from "./calenderinfo";
import "../css/calender.css";
import { useUser } from "../../login/js/userContext";

// 주어진 기간(startDay ~ endDay)을 주 단위(6주)로 나누는 함수
const groupDatesByWeek = (startDay, endDay) => {
  const weeks = [];
  let currentWeek = [];
  let currentDate = new Date(startDay);

  while (currentDate <= endDay) {
    currentWeek.push(new Date(currentDate));

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  // 6주가 안 되면 다음 날짜들로 채워서 6주 맞추기
  while (weeks.length < 6) {
    const lastWeek = weeks[weeks.length - 1];
    const lastDate = new Date(lastWeek[lastWeek.length - 1]);

    let extraWeek = [];
    for (let i = 0; i < 7; i++) {
      const newDate = new Date(lastDate);
      newDate.setDate(lastDate.getDate() + i + 1);
      extraWeek.push(newDate);
    }

    weeks.push(extraWeek);
  }

  return weeks;
};

const Calendar = () => {
  const navigate = useNavigate();
  const { user, employeeNumber } = useUser();
  console.log("🧪 Calendar useUser:", { user, employeeNumber });

  const [date, setDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showOption, setShowOption] = useState(false);

  const year = date.getFullYear();
  const month = date.getMonth();

  const firstMonth = new Date(year, month, 1);
  const startDay = new Date(firstMonth);
  startDay.setDate(startDay.getDate() - startDay.getDay());

  const lastDayOfMonth = new Date(year, month + 1, 0);
  const endDay = new Date(lastDayOfMonth);
  endDay.setDate(lastDayOfMonth.getDate() + (6 - lastDayOfMonth.getDay()));

  const weeks = groupDatesByWeek(startDay, endDay);

  // ✨ 날짜 선택 핸들러
  const handleOnTarget = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = dateObj.getMonth() + 1;
    const d = dateObj.getDate();

    const padded = (n) => String(n).padStart(2, "0");

    setSelectedDate({
      year: y,
      month: m,
      day: d,
      formatted: `${y}-${padded(m)}-${padded(d)}`,
    });

    setShowOption(true);
  };

  const isSelected = (day) =>
    selectedDate &&
    selectedDate.day === day.getDate() &&
    selectedDate.month === day.getMonth() + 1 &&
    selectedDate.year === day.getFullYear();

  // 🔥 사원번호 기반 로그아웃
  const handleLogout = async () => {
    const employeeNo = employeeNumber ?? user?.employee_number ?? null;


    if (!employeeNo) {
      alert("사원번호 정보가 없어 로그아웃을 진행할 수 없습니다.");
      return;
    }

    const body = {
      employee_number: employeeNo,
    };

    console.log("user_logout DELETE 바디:", body);
    console.log("user_logout DELETE 바디(JSON):", JSON.stringify(body));

    try {
      const response = await fetch("/api/user_logout/", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const text = await response.text();
      console.log("user_logout 응답:", text);

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      navigate("/"); // 로그인 화면으로 이동
    } catch (error) {
      console.error(error);
      alert("Logout error");
    }
  };

  return (
    <Box position="relative" className="calenderbk">
      {/* 🔥 오른쪽 상단 로그아웃 버튼 */}
      <Button
        position="absolute"
        top="10px"
        right="15px"
        colorScheme="red"
        size="sm"
        onClick={handleLogout}
      >
        로그아웃
      </Button>

      <div className="calender_sub">
        {/* 유저 이름 표시 */}
        <div>
          <h2>{user?.user_name || user?.admin_id || user || "사용자"}님</h2>
        </div>

        {/* 월 이동 영역 */}
        <div className="calender-check">
          <button onClick={() => setDate(subMonths(date, 1))}>이전 달</button>
          <span>
            {year}년 {month + 1}월
          </span>
          <button onClick={() => setDate(addMonths(date, 1))}>다음 달</button>
        </div>

        {/* 달력 테이블 */}
        <table>
          <thead>
            <tr>
              <th>일</th>
              <th>월</th>
              <th>화</th>
              <th>수</th>
              <th>목</th>
              <th>금</th>
              <th>토</th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, i) => (
              <tr key={i}>
                {week.map((day, j) => (
                  <td
                    key={j}
                    onClick={() => handleOnTarget(day)}
                    style={{
                      backgroundColor: isSelected(day)
                        ? "lightblue"
                        : "transparent",
                      color:
                        day.getMonth() !== month
                          ? "lightgray"
                          : day.getDay() === 0
                          ? "red"
                          : day.getDay() === 6
                          ? "blue"
                          : "black",
                    }}
                  >
                    {day.getDate()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✨ 날짜 클릭 시 밑에 옵션창 */}
      {showOption && <Option selectedDate={selectedDate} />}
    </Box>
  );
};

export default Calendar;
