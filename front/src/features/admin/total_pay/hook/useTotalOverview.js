import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@chakra-ui/react";

import { fetchTotalData } from "../../../../services/api/fetchTotalData";
import { income_filter_Data } from "../api/company_filter";
import { expense_filter_Data } from "../api/expense_filter";

const getCurrentMonth = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
};

const getPeriodLabel = (month) => {
  const [year, monthNumber] = month.split("-").map(Number);
  const start = new Date(year, monthNumber - 6, 1);
  return `${start.getFullYear()}년 ${start.getMonth() + 1}월 ~ ${year}년 ${monthNumber}월`;
};

const shiftMonth = (month, offset) => {
  const [year, monthNumber] = month.split("-").map(Number);
  const shifted = new Date(year, monthNumber - 1 + offset, 1);
  return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, "0")}`;
};

const getMonthRange = (month) => {
  const [year, monthNumber] = month.split("-").map(Number);
  return {
    start: new Date(year, monthNumber - 1, 1),
    end: new Date(year, monthNumber, 0),
  };
};

export default function useTotalOverview() {
  const toast = useToast();
  const [month, setMonth] = useState(getCurrentMonth);
  const [data, setData] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const trendMonths = Array.from({ length: 6 }, (_, index) => shiftMonth(month, index - 5));
      const currentRange = getMonthRange(month);
      const [period, incomeDetails, expenseDetails] = await Promise.all([
        fetchTotalData({ month, toast }),
        income_filter_Data(currentRange, toast),
        expense_filter_Data(currentRange, toast),
      ]);

      setData(period);
      const monthlyMap = new Map((period?.monthlyData || []).map((item) => [item.key, item]));
      setMonthlyData(trendMonths.map((trendMonth) => {
        const item = monthlyMap.get(trendMonth);
        const totalRevenue = item?.totalRevenue || 0;
        const totalExpense = item?.totalExpense || 0;

        return {
          key: trendMonth,
          name: `${Number(trendMonth.slice(5))}월`,
          totalRevenue,
          totalExpense,
          netProfit: totalRevenue - totalExpense,
        };
      }));
      setTransactions([
        ...(incomeDetails?.data || []).map((item) => ({
          id: item.Income_uuid,
          type: "income",
          date: item.date,
          name: item.company_name,
          detail: item.company_detail,
          amount: Number(item.amount),
        })),
        ...(expenseDetails?.data || []).map((item) => ({
          id: item.expense_uuid,
          type: "expense",
          date: item.date,
          name: item.expense_name,
          detail: item.expense_detail,
          amount: Number(item.amount),
        })),
      ].sort((a, b) => new Date(b.date) - new Date(a.date)));
    } finally {
      setLoading(false);
    }
  }, [month, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const sixMonthTotalRevenue = data?.totalRevenue || 0;
  const sixMonthTotalExpense = data?.totalExpense || 0;

  return {
    month,
    setMonth,
    loading,
    periodLabel: useMemo(() => getPeriodLabel(month), [month]),
    revenueByCompany: data?.revenueByCompany || [],
    expenseData: data?.expenseData || [],
    current: monthlyData[5] || { totalRevenue: 0, totalExpense: 0, netProfit: 0 },
    previous: monthlyData[4] || { totalRevenue: 0, totalExpense: 0, netProfit: 0 },
    expenseTrend: monthlyData.map((item) => ({ name: item.name, value: item.totalExpense })),
    monthlyTrend: monthlyData.map((item) => ({
      key: item.key,
      name: item.name,
      income: item.totalRevenue,
      expense: item.totalExpense,
    })),
    transactions,
    totalRevenue: sixMonthTotalRevenue,
    totalExpense: sixMonthTotalExpense,
    netProfit: sixMonthTotalRevenue - sixMonthTotalExpense,
  };
}
