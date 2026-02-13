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

      /* 🔥 모바일은 auto, PC는 고정 */
      height={isMobile ? "auto" : "calc(100vh - 140px)"}
      contentHeight={isMobile ? "auto" : undefined}

      events={events}
      dateClick={onDateClick}

      /* 🔥 여기 추가 1 */
      dayMaxEventRows={3}

      /* 🔥 여기 추가 2 */
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

      /* 외부 제어용 ref */
      ref={(fc) => (window.calendarRef = fc)}

     datesSet={(arg) => {
        onTitleChange?.(arg.view.title);
      }}
            /* 선택 날짜 스타일 */
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
