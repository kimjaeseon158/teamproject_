import { useState } from "react";
import { fetchUserMonthlySummary } from "../api/userMonthly";

export function useCalendarState() {
  const today = new Date();

  const formatLocal = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const initialDate = {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
    formatted: formatLocal(today),
  };

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [events, setEvents] = useState([]); // 캘린더용 이벤트 데이터
  const [summary, setSummary] = useState(null); // 월간 요약 (금액 등)

  // 🎨 상태별 색상 (승인: 녹색, 반려: 빨간색, 대기: 노란색)
  const getStatusColor = (isApproved) => {
    if (isApproved === true) return "#28a745"; // 승인
    if (isApproved === false) return "#dc3545"; // 반려
    return "#ffc107"; // 대기 (is_approved === null)
  };

  /**
   * 백엔드 API로부터 월간 데이터를 로드하여 FullCalendar 이벤트로 변환합니다.
   */
  const loadMonthlyData = async (ym) => {
    try {
      const data = await fetchUserMonthlySummary(ym);
      setSummary(data);

      const groupedByDate = data.daily_list.reduce((acc, item) => {
        const dateItems = acc.get(item.date) || [];
        dateItems.push(item);
        acc.set(item.date, dateItems);
        return acc;
      }, new Map());

      const transformedEvents = Array.from(groupedByDate.entries()).map(([date, items]) => {
        const primary = items[0];
        const color = getStatusColor(primary.is_approved);
        const workType =
          primary.details?.[0]?.work_type ||
          primary.detail_amounts?.[0]?.work_type ||
          primary.work_type ||
          primary.work_shift;
        const totalAmount = items.reduce(
          (sum, item) => sum + (Number(item.amount) || 0),
          0
        );

        return {
          id: `${date}-${primary.work_place}`,
          title: `근무지 - ${primary.work_place} \n ${workType} - ${primary.amount.toLocaleString()}원`,
          start: date,
          backgroundColor: color,
          borderColor: color,
          textColor: primary.is_approved === null ? "black" : "white", // 노란색 배경엔 검은 글씨 권장
          extendedProps: {
            ...primary,
            work_type: workType,
            calendar_amount: totalAmount,
            grouped_items: items,
            extra_count: Math.max(0, items.length - 1),
          },
        };
      });

      setEvents(transformedEvents);
    } catch (err) {
      console.error("Monthly Data Load Error:", err);
    }
  };

  /* 🔥 dateStr 그대로 받음 */
  const handleDateClick = (dateStr) => {
    const d = new Date(dateStr);
    const next = {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
      formatted: dateStr,
    };
    setSelectedDate(next);
  };

  const goToday = () => {
    const api = window.calendarRef?.getApi();
    if (!api) return;

    api.today();
    const d = api.getDate();

    const next = {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
      formatted: formatLocal(d),
    };

    setSelectedDate(next);
  };

  const goToDate = ({ formatted }) => {
    const api = window.calendarRef?.getApi();
    if (!api) return;

    api.gotoDate(formatted);
    const d = new Date(formatted);

    const next = {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
      formatted,
    };

    setSelectedDate(next);
  };

  return {
    selectedDate,
    setSelectedDate,
    handleDateClick,
    goToday,
    goToDate,
    events,
    summary,
    loadMonthlyData,
  };
}
