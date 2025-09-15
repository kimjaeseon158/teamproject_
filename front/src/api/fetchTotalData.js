// src/js/fetchTotalData.js
import { total_payPost } from "../dashboard/js/total_payPostLogic";

export async function fetchTotalData({ start, end, toast }) {
  const payload = {
    start_date: start.toISOString().split("T")[0],
    end_date: end.toISOString().split("T")[0],
  };

  const data = await total_payPost(payload, toast);

  if (!data || !data.success) return null;

  // 수익/지출 배열 변환
  const revenueByCompany = Object.entries(data.data.income_totals || {}).map(
    ([name, value]) => ({ name, value })
  );
  const expenseData = Object.entries(data.data.expense_totals || {}).map(
    ([name, value]) => ({ name, value })
  );
  const totalRevenue = revenueByCompany.reduce((acc, cur) => acc + cur.value, 0);
  const totalExpense = expenseData.reduce((acc, cur) => acc + cur.value, 0);
  const netProfit = totalRevenue - totalExpense;

  return { revenueByCompany, expenseData, totalRevenue, totalExpense, netProfit };
}
