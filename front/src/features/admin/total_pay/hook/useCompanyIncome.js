import { useCallback, useEffect, useState } from "react";
import { createIncome, updateIncome } from "../api/company_api";
import { income_filter_Data } from "../api/company_filter";
import { toISODate } from "../../utils/dateUtils";

const getInitialRange = () => {
  const today = new Date();
  return { from: new Date(today.getFullYear(), today.getMonth(), 1), to: today };
};

export function useCompanyIncome({ user, loading, toast }) {
  const [range, setRange] = useState(getInitialRange);
  const [incomeData, setIncomeData] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);

  const loadIncome = useCallback(async () => {
    if (!range.from || !range.to) return;
    if (loading || !user) return;

    const result = await income_filter_Data(
      { start: range.from, end: range.to },
      toast
    );

    const list =
      result?.data?.map((r) => ({
        id: r.Income_uuid,
        name: r.company_name,
        detail: r.company_detail,
        amount: Number(r.amount),
        date: new Date(`${r.date}T00:00:00`),
      })) || [];

    setIncomeData(list);
    setTotalIncome(list.reduce((a, c) => a + c.amount, 0));
  }, [range, user, loading, toast]);

  useEffect(() => {
    loadIncome();
  }, [loadIncome]);

  const saveIncomeItems = async (incomeItems) => {
    for (const item of incomeItems) {
      const result = await createIncome(
        {
          date: toISODate(item.date),
          company_name: item.name,
          company_detail: item.detail,
          amount: Number(item.amount),
        },
        toast
      );
      if (!result?.success) throw new Error("수입 저장에 실패했습니다.");
    }
    await loadIncome();
  };

  const updateIncomeItem = async (item) => {
    const result = await updateIncome({
      Income_uuid: item.id,
      start_date: toISODate(range.from),
      end_date: toISODate(range.to),
      date: toISODate(item.date),
      company_name: item.name,
      company_detail: item.detail,
      amount: Number(item.amount),
    }, toast);
    if (!result?.success) throw new Error("수입 수정에 실패했습니다.");
    await loadIncome();
  };

  return {
    range,
    setRange,
    incomeData,
    setIncomeData,
    totalIncome,
    saveIncomeItems,
    updateIncomeItem,
  };
}
