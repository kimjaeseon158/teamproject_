import { useCallback, useEffect, useState } from "react";

import { getAdminWorkPlaceList } from "../api/adminWorkPlace";

export default function useAdminWorkPlaces(toast) {
  const [adminWorkPlaces, setAdminWorkPlaces] = useState([]);
  const [workPlacesLoading, setWorkPlacesLoading] = useState(false);

  const loadAdminWorkPlaces = useCallback(async () => {
    try {
      setWorkPlacesLoading(true);
      const workPlaces = await getAdminWorkPlaceList(toast);
      setAdminWorkPlaces(workPlaces);
    } catch (err) {
      toast({
        title: "관리자 근무지 목록을 불러오지 못했습니다.",
        description: err?.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setWorkPlacesLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAdminWorkPlaces();
  }, [loadAdminWorkPlaces]);

  return {
    adminWorkPlaces,
    loadAdminWorkPlaces,
    workPlacesLoading,
  };
}
