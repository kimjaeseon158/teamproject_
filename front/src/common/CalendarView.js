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

      // 날짜 클릭
      dateClick={(arg) => {
        onDateClick?.(arg.dateStr);
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

      // 날짜 셀 커스터마이징
      dayCellContent={(arg) => {
        const d = arg.date;

        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");

        const dateStr = `${y}-${m}-${day}`;
        const summary = daySummaryMap?.[dateStr];

        return (
          <div style={{ textAlign: "left" }}>
            <div>{d.getDate()}</div>

            {summary && (
              <div style={{ fontSize: "10px", marginTop: "4px" }}>
                {summary.day > 0 && (
                  <div style={{ color: "#3182ce" }}>
                    주간 {summary.day}
                  </div>
                )}
                {summary.night > 0 && (
                  <div style={{ color: "#805ad5" }}>
                    야간 {summary.night}
                  </div>
                )}
                {summary.special > 0 && (
                  <div style={{ color: "#dd6b20" }}>
                    특근 {summary.special}
                  </div>
                )}
              </div> 
            )}
          </div>
        );
      }}
    />
  );
}