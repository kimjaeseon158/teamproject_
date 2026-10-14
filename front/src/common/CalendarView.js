import { useRef, useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import koLocale from "@fullcalendar/core/locales/ko";
import { useBreakpointValue } from "@chakra-ui/react";
import { getHolidayDates } from "./holidayCalendar";
import "./css/calendar.css";

const formatWon = (value) => {
  if (value == null || Number.isNaN(Number(value))) return "-";
  return `${Number(value).toLocaleString()}원`;
};

const isOvertimeType = (workType) =>
  String(workType || "").includes("잔업") || String(workType || "").includes("연장");

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getVisibleYears = (start, end) => {
  const lastVisibleDate = new Date(end);
  lastVisibleDate.setDate(lastVisibleDate.getDate() - 1);

  const years = [];
  for (let year = start.getFullYear(); year <= lastVisibleDate.getFullYear(); year += 1) {
    years.push(year);
  }
  return years;
};

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
  observeContainerResize = false,
}) {
  const isMobileValue = useBreakpointValue({
    base: true,
    lg: false,
  });
  const isMobile = isMobileProp !== undefined ? isMobileProp : isMobileValue;

  const calendarRef = useRef(null);
  const containerRef = useRef(null);
  const lastYmRef = useRef(null);
  const [containerSize, setContainerSize] = useState(null);
  const [holidayDates, setHolidayDates] = useState(() => new Set());

  useEffect(() => {
    if (!observeContainerResize || !containerRef.current) return;
    let frame;
    const observer = new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width);
      const height = Math.round(entry.contentRect.height);
      // Ignore temporary zero-size frames while the widget is being laid out.
      if (width <= 0 || height <= 0) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setContainerSize((previous) => previous?.width === width && previous?.height === height
          ? previous : { width, height });
      });
    });
    observer.observe(containerRef.current);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [observeContainerResize]);

  useEffect(() => {
    if (!observeContainerResize || !containerSize) return;
    const frame = requestAnimationFrame(() => calendarRef.current?.getApi().updateSize());
    return () => cancelAnimationFrame(frame);
  }, [observeContainerResize, containerSize]);

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

  const calendar = (
    <FullCalendar
      ref={calendarRef}
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      initialDate={initialDateValue}
      locale={koLocale}
      headerToolbar={false}
      height={(observeContainerResize ? containerSize?.height : undefined)
        ?? calendarHeight ?? (isMobile ? "auto" : "calc(100vh - 140px)")}
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
        const dateStr = formatLocalDate(arg.date);
        const classNames = [];

        const target = selectedDate?.formatted || selectedDate;
        if (dateStr === target) classNames.push("selected-day");
        if (holidayDates.has(dateStr)) classNames.push("holiday-day");
        return classNames;
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

        getHolidayDates(getVisibleYears(arg.start, arg.end))
          .then((dates) => {
            setHolidayDates((previous) => {
              const hasNewDate = [...dates].some((holidayDate) => !previous.has(holidayDate));
              if (!hasNewDate) return previous;
              const merged = new Set([...previous, ...dates]);
              return merged;
            });
          })
          .catch((error) => {
            console.error("공휴일 정보를 불러오지 못했습니다.", error);
          });

        if (lastYmRef.current !== ym) {
          lastYmRef.current = ym;
          onTitleChange?.(ym);
        }
      }}
      dayCellContent={(arg) => {
        const dateStr = formatLocalDate(arg.date);
        const target = selectedDate?.formatted || selectedDate;
        const isSelected = dateStr === target;
        const isHoliday = holidayDates.has(dateStr);

        return (
          <div style={{ textAlign: "left", padding: "2px" }}>
            <div style={{
              color: isSelected ? "white" : isHoliday ? "#e53e3e" : undefined,
              fontWeight: isHoliday ? 500 : undefined,
            }}>
              {arg.dayNumberText.replace("일", "")}
            </div>
          </div>
        );
      }}
    />
  );
  return observeContainerResize
    ? <div ref={containerRef} style={{ position: "absolute", inset: 0, minWidth: 0, minHeight: 0 }}>{calendar}</div>
    : calendar;
}
