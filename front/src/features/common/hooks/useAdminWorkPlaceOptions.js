import { useCallback, useEffect, useMemo, useState } from "react";

import { getAdminWorkPlaceList } from "../../admin/work_place/api/adminWorkPlace";

const getWorkPlaceName = (workPlace) => {
  if (typeof workPlace === "string") return workPlace;
  return workPlace?.work_place ?? "";
};

export default function useAdminWorkPlaceOptions(toast, enabled = true) {
  const [workPlaces, setWorkPlaces] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadWorkPlaces = useCallback(async () => {
    try {
      if (!enabled) return;
      setLoading(true);
      const list = await getAdminWorkPlaceList(toast);
      setWorkPlaces(Array.isArray(list) ? list : []);
    } catch (err) {
      setWorkPlaces([]);
      toast?.({
        title: "근무지 목록을 불러오지 못했습니다.",
        description: err?.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [enabled, toast]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      setWorkPlaces([]);
      return;
    }

    loadWorkPlaces();
  }, [enabled, loadWorkPlaces]);

  const workPlaceNames = useMemo(() => {
    const names = workPlaces.map(getWorkPlaceName).filter(Boolean);
    return Array.from(new Set(names));
  }, [workPlaces]);

  return {
    loading,
    reload: loadWorkPlaces,
    workPlaceNames,
    workPlaces,
  };
}
