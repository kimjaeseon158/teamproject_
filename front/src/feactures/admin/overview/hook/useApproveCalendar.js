import { useEffect, useState } from "react";
import { getAdminWorkDays } from "../../work_day/api/adminWorkday";

/* 월 시작/끝 계산 */
function getMonthRange(date) {
  const year = date.getFullYear();
  const month = date.getMonth();

  const start = new Date(year, month, 1+1);
  const end = new Date(year, month + 1, 0+1);

  const toYMD = (d) => d.toISOString().split("T")[0];

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
          start_date: startDate,
          end_date: endDate,
        });

        const pendingOnly = Array.isArray(workDays)
          ? workDays.filter((item) => item.is_approved === null)
          : [];

        setRawData(pendingOnly);

        const mapped = pendingOnly.map((item) => ({
          id: `${item.user_uuid}-${item.work_date}`,
          title: `${item.user_name} (${item.work_shift || ""})`,
          start: new Date(item.work_start),
          end: new Date(item.work_end),
          resource: item,
        }));

        setEvents(mapped);
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