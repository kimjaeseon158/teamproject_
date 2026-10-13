import { useEffect, useState } from "react";

import { fetchOverviewPendingWorkDays } from "../api/overviewApi";

const getDisplayWorkType = (item) => {
  const specialType = (item.details || [])
    .map((detail) => String(detail.work_type || "").trim())
    .find((type) => type.includes("특근"));

  return specialType || item.work_shift || "";
};

const getWorkDate = (item) =>
  String(item.work_date || item.work_start || "").slice(0, 10);

const toCalendarEvents = (items) => {
  const groupedByDate = items.reduce((groups, item) => {
    const date = getWorkDate(item);
    if (!date) return groups;

    const dateItems = groups.get(date) || [];
    dateItems.push(item);
    groups.set(date, dateItems);
    return groups;
  }, new Map());

  return Array.from(groupedByDate.entries()).map(([date, dateItems]) => {
    const primary = dateItems[0];

    return {
      id: `${primary.user_uuid}-${date}`,
      title: `${primary.user_name} (${getDisplayWorkType(primary)})`,
      start: date,
      backgroundColor: "#ffc107",
      borderColor: "#ffc107",
      textColor: "black",
      extendedProps: {
        ...primary,
        grouped_items: dateItems,
        extra_count: Math.max(0, dateItems.length - 1),
      },
    };
  });
};

export default function useApproveCalendar(currentDate, toast) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rawData, setRawData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetchOverviewPendingWorkDays(currentDate, { toast });
        const pendingOnly = Array.isArray(response?.data) ? response.data : [];

        setRawData(pendingOnly);
        setTotalCount(Number(response?.pagination?.total_count) || pendingOnly.length);
        setEvents(toCalendarEvents(pendingOnly));
      } catch (err) {
        console.error("승인 대기 조회 실패", err);
        setEvents([]);
        setRawData([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentDate, toast]);

  return { events, loading, rawData, totalCount };
}
