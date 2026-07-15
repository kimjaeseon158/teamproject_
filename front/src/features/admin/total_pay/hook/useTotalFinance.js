import { useCallback, useEffect, useState } from "react";

import { three_month_totals } from "../api/expense3month";

const sumMonth = (obj) =>
  Object.values(obj || {}).reduce((sum, value) => sum + Number(value), 0);

const formatKoreanMonth = (key) => {
  const [year, month] = key.split("-");

  return `${year}년 ${month}월`;
};

const addMonth = (year, month, delta) => {
  const date = new Date(year, month - 1);
  date.setMonth(date.getMonth() + delta);

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const getCenteredMonths = (year, month) => {
  const base = new Date(year, month - 1);
  const months = [];

  for (let i = -1; i <= 1; i++) {
    const date = new Date(base);
    date.setMonth(base.getMonth() + i);

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");

    months.push(`${yyyy}-${mm}`);
  }

  return months;
};

export function useTotalFinance({ toast }) {
  const today = new Date();
  const initialMonth = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}`;

  const [apiMonth, setApiMonth] = useState(initialMonth);
  const [selectedDetailMonth, setSelectedDetailMonth] = useState(null);
  const [rawMonthMap, setRawMonthMap] = useState({});
  const [threeMonthData, setThreeMonthData] = useState([]);
  const [detailData, setDetailData] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);

  const fetchAll = useCallback(async (monthStr) => {
    const [year, monthStrNum] = monthStr.split("-");
    const monthNum = Number(monthStrNum);
    const requestMonth = addMonth(Number(year), monthNum, 1);

    const res = await three_month_totals({ month: requestMonth }, toast);
    if (!res?.data) return;

    const monthKeys = getCenteredMonths(Number(year), monthNum);
    const monthMap = {};

    monthKeys.forEach((key) => {
      monthMap[key] = res.data[`expense_totals_${key}`] || {};
    });

    setRawMonthMap(monthMap);
    setThreeMonthData(
      monthKeys.map((key) => ({
        key,
        label: formatKoreanMonth(key),
        total: sumMonth(monthMap[key]),
      }))
    );
    setSelectedDetailMonth(monthStr);
  }, [toast]);

  useEffect(() => {
    fetchAll(apiMonth);
  }, [apiMonth, fetchAll]);

  useEffect(() => {
    if (!selectedDetailMonth) return;

    const selectedData = rawMonthMap[String(selectedDetailMonth).trim()] || {};
    const parsed = Object.entries(selectedData).map(([name, amount]) => ({
      name,
      amount: Number(amount),
    }));

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
