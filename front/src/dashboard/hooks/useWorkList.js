import { useState, useCallback } from "react";
import { getWorkPlaceList } from "../api/work_place/userWorkplace_list";

export function useDailyPay() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDailyPay = useCallback(async (payload, toast) => {
    setLoading(true);

    try {
      const result = await getWorkPlaceList(payload, toast);

      if (result?.success === "true") {
        setData(result.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, fetchDailyPay };
}
