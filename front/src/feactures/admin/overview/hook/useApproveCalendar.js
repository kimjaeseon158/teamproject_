import { useEffect, useState } from "react";
import { getAdminWorkDays } from "../../work_day/api/adminWorkday";

/* 월 시작/끝 계산 */
function getMonthRange(date) {
  const year = date.getFullYear();
  const month = date.getMonth();

  // 해당 월의 1일
  const start = new Date(year, month, 1);
  // 해당 월의 마지막 날 (다음달의 0일 = 이번달 마지막 날)
  const end = new Date(year, month + 1, 0);

  // 로컬 날짜 기준으로 YYYY-MM-DD 포맷팅 (ISO 사용 시 시차 발생 가능성 제거)
  const toYMD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
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
          start: item.work_start, // 실제 시작 시간 (ISO string)
          end: item.work_end,     // 실제 종료 시간 (ISO string)
          backgroundColor: "#ffc107",
          borderColor: "#ffc107",
          textColor: "black",
          extendedProps: { ...item },
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