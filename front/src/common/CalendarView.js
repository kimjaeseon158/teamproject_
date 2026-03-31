import { useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import koLocale from "@fullcalendar/core/locales/ko";
import { useBreakpointValue } from "@chakra-ui/react";
import "./css/calendar.css";

export default function CalendarView({
  events = [],
  onDateClick,
  onEventClick,
  onTitleChange,
  selectedDate,
  daySummaryMap,
}) {
  const isMobile = useBreakpointValue({
    base: true,
    md: false,
  });

  const calendarRef = useRef(null);
  const lastYmRef = useRef(null);

  // 🔥 FullCalendar API 연결
  useEffect(() => {
    window.calendarRef = calendarRef.current;
  }, []);

  return (
    <FullCalendar
      ref={calendarRef}
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      locale={koLocale}
      headerToolbar={false}
      height={isMobile ? "auto" : "calc(100vh - 140px)"}
      events={events}
      dayMaxEvents={2} // 🔥 2명 이상이면 +N 표시
      moreLinkClick="popover" // 🔥 클릭 시 팝오버로 전체 표시

      // 날짜 클릭
      dateClick={(arg) => {
        onDateClick?.(arg.dateStr);
      }}

      // 이벤트 클릭
      eventClick={(arg) => {
        onEventClick?.(arg.event);
      }}

      // 🔥 월 변경 감지 (루프 방지)
      datesSet={(arg) => {
        const date = arg.view.currentStart;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const ym = `${year}-${month}`;

        if (lastYmRef.current !== ym) {
          lastYmRef.current = ym;
          onTitleChange?.(ym);
        }
      }}

      // 날짜 셀 커스터마이징 (숫자만 표시하여 높이 고정)
      dayCellContent={(arg) => {
        return (
          <div style={{ textAlign: "left", padding: "2px" }}>
            <div>{arg.dayNumberText.replace('일', '')}</div>
          </div>
        );
      }}
    />
  );
}
