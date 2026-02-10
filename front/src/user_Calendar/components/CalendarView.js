// src/user_calender/components/CalendarView.jsx
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function CalendarView({
  events,
  onDateClick,
}) {
  return (
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      headerToolbar={false}

      /* 🔥 높이 — 이게 중요 */
      height="calc(100vh - 140px)"

      events={events}
      dateClick={onDateClick}

      /* 외부에서 제어하기 위한 ref */
      ref={(fc) => (window.calendarRef = fc)}

      /* 헤더 타이틀 연동 */
      datesSet={(arg) => {
        const titleEl = document.getElementById("fc-title-box");
        if (titleEl) {
          titleEl.innerText = arg.view.title;
        }
      }}

      /* 선택된 날짜 스타일 */
      dayCellClassNames={(arg) => {
        const y = arg.date.getFullYear();
        const m = arg.date.getMonth() + 1;
        const d = arg.date.getDate();

        if (
          y === window.selectedDate?.year &&
          m === window.selectedDate?.month &&
          d === window.selectedDate?.day
        ) {
          return ["fc-selected-day"];
        }
        return [];
      }}
    />
  );
}
