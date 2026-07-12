import { useEffect, useState } from "react";
import { getAdminWorkDays } from "../../work_day/api/adminWorkday";

function getMonthRange(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);

  const toYMD = (target) => {
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, "0");
    const day = String(target.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  return {
    startDate: toYMD(start),
    endDate: toYMD(end),
  };
}

export default function useApproveCalendar(currentDate) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rawData, setRawData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { startDate, endDate } = getMonthRange(currentDate);

        const workDays = await getAdminWorkDays({
          status: "대기",
          start_date_str: startDate,
          end_date_str: endDate,
        });

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
  }, [currentDate]);

  return { events, loading, rawData };
}
