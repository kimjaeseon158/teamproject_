import { useEffect, useMemo, useRef, useState } from "react";
import { three_month_totals } from "../api/expense3month";
const monthKey = (year, month) => {
  const date = new Date(year, month - 1, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};
const sum = (data) => Object.values(data || {}).reduce((total, value) => total + Number(value), 0);
export function useTotalFinance({ toast }) {
  const today = new Date();
  const [apiMonth, setApiMonth] = useState(() => monthKey(today.getFullYear(), today.getMonth() + 1));
  const [selectedDetailMonth, setSelectedDetailMonth] = useState(null);
  const [rawMonthMap, setRawMonthMap] = useState({});
  const [threeMonthData, setThreeMonthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const requestId = useRef(0);
  useEffect(() => {
    const id = ++requestId.current;
    const load = async () => {
      setLoading(true);
      try {
        const [year, month] = apiMonth.split("-").map(Number);
        const res = await three_month_totals({ month: monthKey(year, month + 1) }, toast);
        if (id !== requestId.current) return;
        if (!res?.data) throw new Error("조회 실패");
        const keys = [-1, 0, 1].map((offset) => monthKey(year, month + offset));
        const map = Object.fromEntries(keys.map((key) => [key, res.data[`expense_totals_${key}`] || {}]));
        setRawMonthMap(map);
        setThreeMonthData(keys.map((key) => ({ key, label: key.replace("-", "년 ") + "월", total: sum(map[key]) })));
        setSelectedDetailMonth(apiMonth);
      } catch (error) {
        if (id === requestId.current) toast({ title: "급여 현황을 불러오지 못했습니다.", status: "error" });
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    };
    load();
    return () => { requestId.current += 1; };
  }, [apiMonth, toast]);
  const detailData = useMemo(() => Object.entries(rawMonthMap[selectedDetailMonth] || {}).map(([name, amount]) => ({ name, amount: Number(amount) })), [rawMonthMap, selectedDetailMonth]);
  const totalExpense = useMemo(() => sum(rawMonthMap[selectedDetailMonth]), [rawMonthMap, selectedDetailMonth]);
  return { apiMonth, setApiMonth, selectedDetailMonth, setSelectedDetailMonth, threeMonthData, detailData, totalExpense, loading };
}
