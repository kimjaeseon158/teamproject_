import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useBreakpointValue } from "@chakra-ui/react";

export default function CalendarView({
  events,
  onDateClick,
  onTitleChange,
  selectedDate
}) {
  const isMobile = useBreakpointValue({
    base: true,
    md: false,
  });

  return (
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      headerToolbar={false}
      height={isMobile ? "auto" : "calc(100vh - 140px)"}
      contentHeight={isMobile ? "auto" : undefined}
      events={events}
      dateClick={onDateClick}
      dayMaxEventRows={3}
      ref={(fc) => (window.calendarRef = fc)}

      /* 🔥 월 변경 동기화 */
      datesSet={(arg) => {
        const date = arg.view.currentStart;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const ym = `${year}-${month}`;
        onTitleChange?.(ym);
      }}

      dayCellClassNames={(arg) => {
        if (!selectedDate) return [];

        const y = arg.date.getFullYear();
        const m = arg.date.getMonth() + 1;
        const d = arg.date.getDate();

        if (
          y === selectedDate.year &&
          m === selectedDate.month &&
          d === selectedDate.day
        ) {
          return ["fc-selected-day"];
        }

        return [];
      }}
    />
  );
}