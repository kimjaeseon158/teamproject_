import { useState } from "react";
import { getWorkPlaceList } from "../api/userWorkplace_list";

export function useDailyPay() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDailyPay = async (params = {}, toast) => {
    setLoading(true);

    try {
      const result = await getWorkPlaceList(params, toast);

      // 🔥 검색일 때만 결과없음 알림
    const isSearch =
        params.user_name?.trim() ||
        params.work_place?.trim();

      if (isSearch && (!result?.users || result.users.length === 0)) {
        toast({
          title: "검색 결과 없음",
          description: "조건에 맞는 데이터가 없습니다.",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
    }
    setData(result?.users || []);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    fetchDailyPay,
  };
}