import { useEffect, useState } from "react";

import { fetchOverviewWorkPlaces } from "../api/overviewApi";

export default function useOverviewWorkPlaces(toast) {
  const [adminWorkPlaces, setAdminWorkPlaces] = useState([]);

  useEffect(() => {
    const loadAdminWorkPlaces = async () => {
      try {
        const workPlaces = await fetchOverviewWorkPlaces({ toast });
        setAdminWorkPlaces(workPlaces);
      } catch (err) {
        toast({
          title: "관리자 근무지 목록을 불러오지 못했습니다.",
          description: err?.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    loadAdminWorkPlaces();
  }, [toast]);

  return adminWorkPlaces;
}
