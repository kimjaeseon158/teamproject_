import { useState, useCallback } from "react";
import { getWorkPlaceList } from "../api/userWorkplace_list";

export function useDailyPay() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  /**
   * 🔥 핵심: useCallback으로 고정
   */
  const fetchDailyPay = useCallback(
    async (params = {}, toast) => {
      setLoading(true);

      try {
        const result = await getWorkPlaceList(params, toast);

        const isSearch =
          params.user_name?.trim() ||
          params.work_place?.trim();

        if (
          isSearch &&
          (!result?.users || result.users.length === 0)
        ) {
          toast?.({
            title: "검색 결과 없음",
            description:
              "조건에 맞는 데이터가 없습니다.",
            status: "info",
            duration: 3000,
            isClosable: true,
          });
        }

        setData(result?.users || []);
      } catch (error) {
        console.error(" fetchDailyPay error");
      } finally {
        setLoading(false);
      }
    },
    [] // 🔥 절대 data 넣지 말 것
  );

  return {
    data,
    loading,
    fetchDailyPay,
  };
}