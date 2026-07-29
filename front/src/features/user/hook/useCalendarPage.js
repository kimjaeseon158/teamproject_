import { useState } from "react";
import { useMediaQuery } from "@chakra-ui/react";

import { useUser } from "../../auth/userContext";
import { useCalendarState } from "./useCalendarsState";

export default function useCalendarPage() {
  const { userName, userUuid } = useUser();
  const [calendarTitle, setCalendarTitle] = useState("");
  const calendar = useCalendarState();
  const [isMobile] = useMediaQuery("(max-width: 1024px)");
  const [editingWork, setEditingWork] = useState(null);
  const [selectableWorks, setSelectableWorks] = useState([]);

  const getWorkItemsFromEvent = (event) => {
    const data = event?.extendedProps;
    if (!data) return [];

    return data.grouped_items?.length ? data.grouped_items : [data];
  };

  const getWorkItemsForDate = (event) => {
    const eventItems = getWorkItemsFromEvent(event);
    const targetDate = eventItems[0]?.date || event?.startStr;
    if (!targetDate) return eventItems;

    const sameDateEvent = calendar.events.find((item) => item.start === targetDate);
    return sameDateEvent?.extendedProps
      ? getWorkItemsFromEvent(sameDateEvent)
      : eventItems;
  };

  const goToday = () => {
    const api = window.calendarRef?.getApi();
    if (!api) return;

    api.today();

    const d = api.getDate();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    calendar.setSelectedDate({
      year: y,
      month: d.getMonth() + 1,
      day: d.getDate(),
      formatted: `${y}-${m}-${day}`,
    });
  };

  const goToDate = ({ formatted }) => {
    window.calendarRef?.getApi()?.gotoDate(formatted);
  };

  const handleTitleChange = (ym) => {
    setCalendarTitle(ym);
    calendar.loadMonthlyData(ym);
  };

  const handleEventClick = (event) => {
    const workItems = getWorkItemsForDate(event);
    const pendingItems = workItems.filter((item) => item.is_approved === null);
    const targetDate = workItems[0]?.date || event.startStr;

    if (isMobile) {
      calendar.handleDateClick(targetDate);
      return false;
    }

    if (workItems.length > 1) {
      calendar.handleDateClick(targetDate);
      setSelectableWorks(workItems);
      return true;
    }

    if (pendingItems.length === 1) {
      const pendingWork = pendingItems[0];
      calendar.handleDateClick(pendingWork.date || event.startStr);
      setEditingWork(pendingWork);
      return true;
    }

    calendar.handleDateClick(event.startStr);
    return false;
  };

  return {
    calendar,
    calendarTitle,
    editingWork,
    goToday,
    goToDate,
    onCloseEditWork: () => setEditingWork(null),
    onCloseSelectWork: () => setSelectableWorks([]),
    onEditWork: (work) => setEditingWork(work),
    onEventClick: handleEventClick,
    onSelectPendingWork: (work) => {
      setSelectableWorks([]);
      setEditingWork(work);
    },
    isMobile,
    onTitleChange: handleTitleChange,
    selectableWorks,
    userName,
    userUuid,
  };
}
