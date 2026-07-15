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
  selectedDate, // 🔥 외부에서 관리하는 날짜 (월 이동 동기화용)
  daySummaryMap,
}) {
  const isMobile = useBreakpointValue({
    base: true,
    md: false,
  });

  const calendarRef = useRef(null);
  const lastYmRef = useRef(null);

  // 🔥 FullCalendar API 연결 및 외부 날짜와 동기화
  useEffect(() => {
    window.calendarRef = calendarRef.current;
    
    if (calendarRef.current && selectedDate) {
      const calendarApi = calendarRef.current.getApi();
      if (calendarApi) {
        // selectedDate가 객체 { formatted } 인지 Date 객체인지 판별
        const targetDate = selectedDate.formatted || selectedDate;
        calendarApi.gotoDate(targetDate); // 🔥 Prop으로 받은 날짜로 캘린더 이동
      }
    }
  }, [selectedDate]);

  // FullCalendar가 이해할 수 있는 날짜 값 추출 (초기값용)
  const initialDateValue = selectedDate?.formatted || selectedDate || new Date();

  return (
    <FullCalendar
      ref={calendarRef}
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      initialDate={initialDateValue} // 🔥 초기 날짜 설정 (Date 객체 또는 ISO 문자열)
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
