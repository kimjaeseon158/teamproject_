import { useEffect, useState } from "react";
import { three_month_totals } from "../api/expense3month";

export function useTotalFinance({ toast }) {
  const today = new Date();

  const initialMonth = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}`;

  /* 🔥 API 재호출용 */
  const [apiMonth, setApiMonth] = useState(initialMonth);

  /* 🔥 상세 표시용 */
  const [selectedDetailMonth, setSelectedDetailMonth] =
    useState(initialMonth);

  const [threeMonthRaw, setThreeMonthRaw] = useState({});
  const [threeMonthData, setThreeMonthData] = useState([]);
  const [detailData, setDetailData] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);

  const getPrevMonths = (monthStr) => {
    const [year, month] = monthStr.split("-").map(Number);
    const base = new Date(year, month - 1);

    const format = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    const prev2 = new Date(base);
    prev2.setMonth(base.getMonth() - 2);

    const prev1 = new Date(base);
    prev1.setMonth(base.getMonth() - 1);

    return [format(prev2), format(prev1), format(base)];
  };

  const sumMonth = (obj) =>
    Object.values(obj || {}).reduce(
      (sum, v) => sum + Number(v),
      0
    );

  const fetchAll = async (month) => {
    const res = await three_month_totals({ month }, toast);
    if (!res?.data) return;

    const d = res.data;

    const [m1, m2, m3] = getPrevMonths(month);

    const monthMap = {
      [m1]: d.expense_totals_1,
      [m2]: d.expense_totals_2,
      [m3]: d.expense_totals_3,
    };

    setThreeMonthRaw(monthMap);

    setThreeMonthData([
      { label: m1, total: sumMonth(d.expense_totals_1) },
      { label: m2, total: sumMonth(d.expense_totals_2) },
      { label: m3, total: sumMonth(d.expense_totals_3) },
    ]);

    /* 기본 상세는 기준월 */
    setSelectedDetailMonth(m3);
  };

  /* 🔥 API는 apiMonth가 바뀔 때만 호출 */
  useEffect(() => {
    fetchAll(apiMonth);
  }, [apiMonth]);

  /* 🔥 상세는 raw 데이터에서만 계산 */
  useEffect(() => {
    const selectedData =
      threeMonthRaw[selectedDetailMonth] || {};

    const parsed = Object.entries(selectedData).map(
      ([name, amount]) => ({
        name,
        amount: Number(amount),
      })
    );

    setDetailData(parsed);
    setTotalExpense(sumMonth(selectedData));
  }, [selectedDetailMonth, threeMonthRaw]);

  return {
    apiMonth,
    setApiMonth,                 // 월 선택 버튼용
    selectedDetailMonth,
    setSelectedDetailMonth,      // 그래프 클릭용
    threeMonthData,
    detailData,
    totalExpense,
  };
}