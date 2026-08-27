// src/js/fetchTotalData.js
import { fetchFinanceSummary } from "../../features/admin/total_pay/api/total_payPostLogic";
import { toISODate } from "../../features/admin/utils/dateUtils";

export async function fetchTotalData({ start, end, month, toast }) {
  const payload = month
    ? { date: month }
    : {
        start_date: toISODate(start),
        end_date: toISODate(end),
      };

  const data = await fetchFinanceSummary(payload, toast);

  if (!data || !data.success) return null;

  const monthlyData = Array.isArray(data.data) ? data.data : [];
  const summaryData = Array.isArray(data.data) ? {} : data.data || {};
  const sumCategories = (key) => monthlyData.reduce((result, item) => {
    Object.entries(item?.[key] || {}).forEach(([name, value]) => {
      result[name] = (result[name] || 0) + Number(value || 0);
    });
    return result;
  }, {});

  // 기존 단일 객체 응답과 새로운 6개월 배열 응답을 모두 지원한다.
  const incomeTotals = monthlyData.length ? sumCategories("income_totals") : summaryData.income_totals || {};
  const expenseTotals = monthlyData.length ? sumCategories("expense_totals") : summaryData.expense_totals || {};
  const revenueByCompany = Object.entries(incomeTotals).map(
    ([name, value]) => ({ name, value: Number(value) })
  );
  const expenseData = Object.entries(expenseTotals).map(
    ([name, value]) => ({ name, value: Number(value) })
  );
  const totalRevenue = Number(data.total_income ?? summaryData.total_income ?? 0);
  const totalExpense = Number(data.total_expense ?? summaryData.total_expense ?? 0);
  const netProfit = totalRevenue - totalExpense;

  return {
    revenueByCompany,
    expenseData,
    totalRevenue,
    totalExpense,
    netProfit,
    monthlyData: monthlyData.map((item) => ({
      key: item.date,
      totalRevenue: Number(item.total_income || 0),
      totalExpense: Number(item.total_expense || 0),
    })),
  };
}
