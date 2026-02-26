import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useBreakpointValue, Box } from "@chakra-ui/react";

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
      eventContent={(arg) => (
        <Box
          px="4px"
          py="2px"
          borderRadius="6px"
          bg={arg.event.extendedProps.color || "blue.400"}
          color="white"
          fontSize="10px"
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
        >
          {arg.event.title}
        </Box>
      )}
      ref={(fc) => (window.calendarRef = fc)}

      /* 🔥 여기만 수정 */
      datesSet={(arg) => {
        const date = arg.view.currentStart;

        const ym = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

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