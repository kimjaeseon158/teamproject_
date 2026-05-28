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
    useState(null);

  const [rawMonthMap, setRawMonthMap] = useState({});
  const [threeMonthData, setThreeMonthData] = useState([]);
  const [detailData, setDetailData] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);

  const sumMonth = (obj) =>
    Object.values(obj || {}).reduce(
      (sum, v) => sum + Number(v),
      0
    );

  const formatKoreanMonth = (key) => {
    const [year, month] = key.split("-");
    return `${year}년 ${month}월`;
  };

  const addMonth = (year, month, delta) => {
    const d = new Date(year, month - 1);
    d.setMonth(d.getMonth() + delta);

    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  const getCenteredMonths = (year, month) => {
    const base = new Date(year, month - 1);
    const arr = [];

    for (let i = -1; i <= 1; i++) {
      const d = new Date(base);
      d.setMonth(base.getMonth() + i);

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");

      arr.push(`${yyyy}-${mm}`);
    }

    return arr;
  };

  const fetchAll = async (monthStr) => {
    const [year, monthStrNum] = monthStr.split("-");
    const monthNum = Number(monthStrNum);
    const requestMonth = addMonth(Number(year), monthNum, 1);

    const res = await three_month_totals(
      { month: requestMonth },
      toast
    );

    if (!res?.data) return;

    const d = res.data;

    const monthKeys = getCenteredMonths(Number(year), monthNum);

    const monthMap = {};

    monthKeys.forEach((key) => {
      monthMap[key] =
        d[`expense_totals_${key}`] || {};
    });

    setRawMonthMap(monthMap);

  const parsedThree = monthKeys.map((key) => ({
  key,
  label: formatKoreanMonth(key),
  total: sumMonth(monthMap[key]),
}));

setThreeMonthData(parsedThree);

// 🔥 핵심 수정
setSelectedDetailMonth(monthStr);
  };

  useEffect(() => {
    fetchAll(apiMonth);
  }, [apiMonth]);

  useEffect(() => {
    if (!selectedDetailMonth) return;

    const selectedData =
      rawMonthMap[String(selectedDetailMonth).trim()] || {};

    const parsed = Object.entries(selectedData).map(
      ([name, amount]) => ({
        name,
        amount: Number(amount),
      })
    );

    setDetailData(parsed);
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
