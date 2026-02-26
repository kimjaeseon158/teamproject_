import { useEffect, useState } from "react";
import { income_Data } from "../api/company_api";
import { income_filter_Data } from "../api/company_filter";

export function useCompanyIncome({ user, loading, toast }) {
  const [range, setRange] = useState({ from: null, to: null });
  const [incomeData, setIncomeData] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);

  useEffect(() => {
    if (!range.from || !range.to) return;
    if (loading || !user) return;

    (async () => {
      const result = await income_filter_Data(
        { start: range.from, end: range.to },
        toast
      );

      const list =
        result?.data?.map((r) => ({
          name: r.company_name,
          detail: r.company_detail,
          amount: Number(r.amount),
          date: new Date(r.date),
        })) || [];

      setIncomeData(list);
      setTotalIncome(list.reduce((a, c) => a + c.amount, 0));
    })();
  }, [range, user, loading, toast]);

  const saveFinalList = async (finalList) => {
    for (const item of finalList) {
      await income_Data(
        {
          date: item.date.toISOString().split("T")[0],
          company_name: item.name,
          company_detail: item.detail,
          amount: Number(item.amount),
        },
        toast
      );
    }
  };

  return {
    range,
    setRange,
    incomeData,
    setIncomeData,
    totalIncome,
    saveFinalList,
  };
}
