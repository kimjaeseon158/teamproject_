// useTotalFinance.js

import { useEffect, useState } from "react";
import { three_month_totals } from "../api/expense3month";

export function useTotalFinance({ toast }) {
  const today = new Date();

  const initialMonth = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}`;

  const [apiMonth, setApiMonth] = useState(initialMonth);
  const [selectedDetailMonth, setSelectedDetailMonth] =
    useState(initialMonth);

  const [rawMonthMap, setRawMonthMap] = useState({});
  const [threeMonthData, setThreeMonthData] = useState([]);
  const [detailData, setDetailData] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);

  const sumMonth = (obj) =>
    Object.values(obj || {}).reduce(
      (sum, v) => sum + Number(v),
      0
    );

  const fetchAll = async (monthStr) => {
    const res = await three_month_totals(
      { month: monthStr },
      toast
    );
    if (!res?.data) return;

    const d = res.data;

    const [year, monthStrNum] = monthStr.split("-");
    const monthNum = Number(monthStrNum);

    const prev1 = monthNum === 1 ? 12 : monthNum - 1;
    const prev2 = prev1 === 1 ? 12 : prev1 - 1;

    const formatMonth = (m) =>
      `${year}-${String(m).padStart(2, "0")}`;

    const monthMap = {
      [formatMonth(prev2)]:
        d[`expense_totals_${prev2}`] || {},
      [formatMonth(prev1)]:
        d[`expense_totals_${prev1}`] || {},
      [formatMonth(monthNum)]:
        d[`expense_totals_${monthNum}`] || {},
    };

    setRawMonthMap(monthMap);

    const parsedThree = Object.entries(monthMap).map(
      ([label, value]) => ({
        label,
        total: sumMonth(value),
      })
    );

    setThreeMonthData(parsedThree);

    // 기본 상세 = 선택월
    setSelectedDetailMonth(formatMonth(monthNum));
  };

  /* API는 월 선택 시만 */
  useEffect(() => {
    fetchAll(apiMonth);
  }, [apiMonth]);

  /* 상세는 rawMonthMap 기준으로 계산 */
  useEffect(() => {
    const selectedData =
      rawMonthMap[selectedDetailMonth] || {};

    const parsed = Object.entries(selectedData).map(
      ([name, amount]) => ({
        name,
        amount: Number(amount),
      })
    );

    setDetailData(parsed);
    setTotalExpense(sumMonth(selectedData));
  }, [selectedDetailMonth, rawMonthMap]);

  return {
    apiMonth,
    setApiMonth,
    selectedDetailMonth,
    setSelectedDetailMonth,
    threeMonthData,
    detailData,
    totalExpense,
  };
}