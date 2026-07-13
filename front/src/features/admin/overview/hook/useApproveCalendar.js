import { useEffect, useState } from "react";

import { fetchOverviewPendingWorkDays } from "../api/overviewApi";

export default function useApproveCalendar(currentDate, toast) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rawData, setRawData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const workDays = await fetchOverviewPendingWorkDays(currentDate, { toast });
        const pendingOnly = Array.isArray(workDays)
          ? workDays.filter((item) => item.is_approved === null)
          : [];

        setRawData(pendingOnly);
        setEvents(
          pendingOnly.map((item) => ({
            id: `${item.user_uuid}-${item.work_date}`,
            title: `${item.user_name} (${item.work_shift || ""})`,
            start: item.work_start,
            end: item.work_end,
            backgroundColor: "#ffc107",
            borderColor: "#ffc107",
            textColor: "black",
            extendedProps: { ...item },
          }))
        );
      } catch (err) {
        console.error("승인 대기 조회 실패", err);
        setEvents([]);
        setRawData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentDate, toast]);

  return { events, loading, rawData };
}
