import { useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import koLocale from "@fullcalendar/core/locales/ko";
import { useBreakpointValue } from "@chakra-ui/react";
import "./css/calendar.css";

const formatWon = (value) => {
  if (value == null || Number.isNaN(Number(value))) return "-";
  return `${Number(value).toLocaleString()}원`;
};

const isOvertimeType = (workType) =>
  String(workType || "").includes("잔업") || String(workType || "").includes("연장");

const getDesktopPayLines = (props = {}) => {
  const breakdown = props.amount_breakdown || {};
  const detailAmounts = props.detail_amounts || [];
  const workType = props.work_type || props.work_shift;

  const baseDetail =
    detailAmounts.find((detail) => detail.work_type === workType) ||
    detailAmounts.find((detail) => !isOvertimeType(detail.work_type));

  const baseLabel = baseDetail?.work_type || workType || "근무";
  const baseAmount =
    baseDetail?.amount ??
    breakdown[baseLabel] ??
    breakdown[workType] ??
    0;

  const overtimeAmount =
    detailAmounts
      .filter((detail) => isOvertimeType(detail.work_type))
      .reduce((sum, detail) => sum + (Number(detail.amount) || 0), 0) ||
    Object.entries(breakdown)
      .filter(([key]) => isOvertimeType(key))
      .reduce((sum, [, value]) => sum + (Number(value) || 0), 0);

  return {
    baseLabel,
    baseAmount,
    overtimeAmount,
    totalAmount: props.amount,
    workPlace: props.work_place,
  };
};

export default function CalendarView({
  events = [],
  onDateClick,
  onEventClick,
  onTitleChange,
  selectedDate,
  isMobile: isMobileProp,
  renderEventContent,
  height: calendarHeight,
}) {
  const isMobileValue = useBreakpointValue({
    base: true,
    lg: false,
  });
  const isMobile = isMobileProp !== undefined ? isMobileProp : isMobileValue;

  const calendarRef = useRef(null);
  const lastYmRef = useRef(null);

  useEffect(() => {
    window.calendarRef = calendarRef.current;

    if (calendarRef.current && selectedDate) {
      const targetDate = selectedDate.formatted || selectedDate;
      const timerId = window.setTimeout(() => {
        const calendarApi = calendarRef.current?.getApi();
        calendarApi?.gotoDate(targetDate);
      }, 0);

      return () => window.clearTimeout(timerId);
    }
  }, [selectedDate]);

  const initialDateValue = selectedDate?.formatted || selectedDate || new Date();

  return (
    <FullCalendar
      ref={calendarRef}
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      initialDate={initialDateValue}
      locale={koLocale}
      headerToolbar={false}
      height={calendarHeight ?? (isMobile ? "auto" : "calc(100vh - 140px)")}
      events={events}
      dayMaxEvents={2}
      moreLinkClick="popover"
      eventContent={(arg) => {
        if (renderEventContent) {
          return renderEventContent(arg);
        }

        const backgroundColor = arg.event.backgroundColor;
        const textColor = arg.event.textColor || "white";
        const { amount, calendar_amount } = arg.event.extendedProps;

        if (isMobile) {
          return (
            <div style={{
              fontSize: "0.6rem",
              textAlign: "center",
              fontWeight: "900",
              backgroundColor,
              color: textColor,
              borderRadius: "2px",
              width: "100%",
              padding: "1px 0",
            }}>
              {(calendar_amount ?? amount) !== undefined
                ? `${(calendar_amount ?? amount).toLocaleString()}원`
                : arg.event.title}
            </div>
          );
        }

        const pay = getDesktopPayLines(arg.event.extendedProps);
        const extraCount = arg.event.extendedProps.extra_count || 0;

        if (pay.workPlace && pay.totalAmount !== undefined) {
          return (
            <div style={{
              fontSize: "0.62rem",
              padding: "3px 5px",
              overflow: "hidden",
              lineHeight: "1.14",
              fontWeight: "700",
              backgroundColor,
              color: textColor,
              borderRadius: "6px",
              width: "100%",
              boxSizing: "border-box",
            }}>
              <div style={{
                fontWeight: "900",
                marginBottom: "2px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {pay.workPlace}
              </div>
              <div style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {pay.baseLabel} - {formatWon(pay.baseAmount)}
                {pay.overtimeAmount > 0 && ` / 잔업 - ${formatWon(pay.overtimeAmount)}`}
              </div>
              <div style={{
                marginTop: "2px",
                fontWeight: "900",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                총금액 - {formatWon(pay.totalAmount)}
                {extraCount > 0 && `  +${extraCount}건 더보기`}
              </div>
            </div>
          );
        }

        return (
          <div style={{
            fontSize: "0.72rem",
            padding: "2px 4px",
            overflow: "hidden",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            lineHeight: "1.2",
            fontWeight: "bold",
            backgroundColor,
            color: textColor,
            borderRadius: "4px",
            width: "100%",
            height: "100%",
          }}>
            {arg.event.title}
          </div>
        );
      }}
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
      dateClick={(arg) => {
        onDateClick?.(arg.dateStr);
      }}
      eventClick={(arg) => {
        if (onEventClick) {
          onEventClick(arg.event);
          return;
        }
        onDateClick?.(arg.event.startStr);
      }}
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
      dayCellContent={(arg) => (
        <div style={{ textAlign: "left", padding: "2px" }}>
          <div>{arg.dayNumberText.replace("일", "")}</div>
        </div>
      )}
    />
  );
}
