import { useEffect, useState } from "react";
import { expense_filter_Data } from "../api/expense_filter";
import { expense_Data } from "../api/expense_API";

export function useExpenseData({ toast }) {
  const [range, setRange] = useState({ from: null, to: null });
  const [expenseData, setExpenseData] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);

  useEffect(() => {
    if (!range.from || !range.to) return;

    (async () => {
      const res = await expense_filter_Data(
        { start: range.from, end: range.to },
        toast
      );

      const list =
        res?.data?.map((r) => ({
          name: r.expense_name,
          detail: r.expense_detail,
          amount: Number(r.amount),
          date: new Date(r.date),
        })) || [];

      setExpenseData(list);
      setTotalExpense(list.reduce((a, c) => a + c.amount, 0));
    })();
  }, [range, toast]);

  const saveFinalList = async (finalList) => {
    for (const item of finalList) {
      const result = await expense_Data(
        {
          date: item.date.toISOString().split("T")[0],
          expense_name: item.name,
          expense_detail: item.detail,
          amount: Number(item.amount),
        },
        toast
      );
      if (!result) throw new Error("지출 저장에 실패했습니다.");
    }
  };

  return {
    range,
    setRange,
    expenseData,
    setExpenseData,
    totalExpense,
    saveFinalList,
  };
}
