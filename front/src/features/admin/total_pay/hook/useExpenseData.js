import { useCallback, useEffect, useState } from "react";
import { expense_filter_Data } from "../api/expense_filter";
import { createExpense, updateExpense } from "../api/expense_API";
import { toISODate } from "../../utils/dateUtils";

const getInitialRange = () => {
  const today = new Date();
  return { from: new Date(today.getFullYear(), today.getMonth(), 1), to: today };
};

export function useExpenseData({ toast }) {
  const [range, setRange] = useState(getInitialRange);
  const [expenseData, setExpenseData] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);

  const loadExpenses = useCallback(async () => {
    if (!range.from || !range.to) return;

    const res = await expense_filter_Data(
      { start: range.from, end: range.to },
      toast
    );

    const list =
      res?.data?.map((r) => ({
        id: r.expense_uuid,
        name: r.expense_name,
        detail: r.expense_detail,
        amount: Number(r.amount),
        date: new Date(`${r.date}T00:00:00`),
      })) || [];

    setExpenseData(list);
    setTotalExpense(list.reduce((a, c) => a + c.amount, 0));
  }, [range, toast]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const saveExpenseItems = async (expenseItems) => {
    for (const item of expenseItems) {
      const result = await createExpense(
        {
          date: toISODate(item.date),
          expense_name: item.name,
          expense_detail: item.detail,
          amount: Number(item.amount),
        },
        toast
      );
      if (!result?.success) throw new Error("지출 저장에 실패했습니다.");
    }
    await loadExpenses();
  };

  const updateExpenseItem = async (item) => {
    const result = await updateExpense({
      expense_uuid: item.id,
      start_date: toISODate(range.from),
      end_date: toISODate(range.to),
      date: toISODate(item.date),
      expense_name: item.name,
      expense_detail: item.detail,
      amount: Number(item.amount),
    }, toast);
    if (!result?.success) throw new Error("지출 수정에 실패했습니다.");
    await loadExpenses();
  };

  return {
    range,
    setRange,
    expenseData,
    setExpenseData,
    totalExpense,
    saveExpenseItems,
    updateExpenseItem,
  };
}
