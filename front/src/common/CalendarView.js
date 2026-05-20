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
  isMobile: isMobileProp, // 🔥 추가
  renderEventContent, // 🔥 커스텀 렌더러 주입 허용
  height: calendarHeight,
}) {
  // 🔥 상위에서 전달받은 isMobile이 있으면 그것을 쓰고, 없으면 useBreakpointValue 사용
  const isMobileValue = useBreakpointValue({
    base: true,
    lg: false,
  });
  const isMobile = isMobileProp !== undefined ? isMobileProp : isMobileValue;

  const calendarRef = useRef(null);
  const lastYmRef = useRef(null);

  // 🔥 FullCalendar API 연결 및 외부 날짜와 동기화
  useEffect(() => {
    window.calendarRef = calendarRef.current;
    
    if (calendarRef.current && selectedDate) {
      // selectedDate가 객체 { formatted } 인지 Date 객체인지 판별
      const targetDate = selectedDate.formatted || selectedDate;
      const timerId = window.setTimeout(() => {
        const calendarApi = calendarRef.current?.getApi();
        calendarApi?.gotoDate(targetDate); // 🔥 Prop으로 받은 날짜로 캘린더 이동
      }, 0);

      return () => window.clearTimeout(timerId);
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
      height={calendarHeight ?? (isMobile ? "auto" : "calc(100vh - 140px)")}
      events={events}
      dayMaxEvents={2} // 🔥 2명 이상이면 +N 표시
      moreLinkClick="popover" // 🔥 클릭 시 팝오버로 전체 표시

      // 이벤트 렌더링 커스텀
      eventContent={(arg) => {
        // 1. 외부에서 주입된 렌더러가 있으면 그것을 우선 사용
        if (renderEventContent) {
          return renderEventContent(arg);
        }

        const backgroundColor = arg.event.backgroundColor;
        const textColor = arg.event.textColor || "white";
        const { amount } = arg.event.extendedProps;

        // 2. 모바일: 금액만 심플하게 표시
        if (isMobile) {
          return (
            <div style={{ 
              fontSize: "0.6rem", 
              textAlign: "center",
              fontWeight: "900",
              backgroundColor: backgroundColor,
              color: textColor,
              borderRadius: "2px",
              width: "100%",
              padding: "1px 0"
            }}>
              {amount !== undefined ? `${amount.toLocaleString()}원` : arg.event.title}
            </div>
          );
        }

        // 3. 데스크톱: 제목(줄바꿈 포함) 표시
        return (
          <div style={{ 
            fontSize: "0.72rem", 
            padding: "2px 4px", 
            overflow: "hidden", 
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            lineHeight: "1.2",
            fontWeight: "bold",
            backgroundColor: backgroundColor,
            color: textColor,
            borderRadius: "4px",
            width: "100%",
            height: "100%"
          }}>
            {arg.event.title}
          </div>
        );
      }}

      // 날짜별 클래스 지정
      dayCellClassNames={(arg) => {
        const d = arg.date;
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const dateStr = `${year}-${month}-${day}`;

        const target = selectedDate?.formatted || selectedDate;
        if (dateStr === target) return ["selected-day"];
        return [];
      }}

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
