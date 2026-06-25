import { useState } from "react";
import { getWorkPlaceList } from "../api/userWorkplace_list";

export function useDailyPay() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDailyPay = async (params = {}, toast) => {
    setLoading(true);

    try {
      const result = await getWorkPlaceList(params, toast);

      // ?”¥ ê²€?‰ì¼ ?Œë§Œ ê²°ê³¼?†ìŒ ?Œë¦¼
      const isSearch =
        params.user_name?.trim() ||
        params.work_place?.trim();

      if (isSearch && (!result?.users || result.users.length === 0)) {
        toast?.({
          title: "ê²€??ê²°ê³¼ ?†ìŒ",
          description: "ì¡°ê±´??ë§ëŠ” ?°ì´?°ê? ?†ìŠµ?ˆë‹¤.",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      }

      setData(result?.success ? result.users : []);
    } catch (err) {
      toast?.({
        title: "?¼ê¸‰ ëª©ë¡ ì¡°íšŒ ?¤íŒ¨",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
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
