import { useEffect, useState } from "react";
import { fetchTotalData } from "../../api/fetchTotalData";

export function useTotalFinance({ toast }) {
  const [range, setRange] = useState({
    from: new Date(),
    to: new Date(),
  });

  const [revenueByCompany, setRevenueByCompany] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [netProfit, setNetProfit] = useState(0);

  const fetchData = async (start, end) => {
    const result = await fetchTotalData({ start, end, toast });
    if (!result) return;

    setRevenueByCompany(result.revenueByCompany);
    setExpenseData(result.expenseData);
    setTotalRevenue(result.totalRevenue);
    setTotalExpense(result.totalExpense);
    setNetProfit(result.netProfit);
  };

  useEffect(() => {
    fetchData(range.from, range.to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    range,
    setRange,
    revenueByCompany,
    expenseData,
    totalRevenue,
    totalExpense,
    netProfit,
    fetchData,
  };
}
