import { useEffect, useState } from "react";

import { getAdminWorkPlaceList } from "../api/adminWorkPlace";
import { notify } from "../utils/rateFormat";

export default function useRateEditPlaces({
  initialAdminWorkPlaces,
  isOpen,
  toast,
}) {
  const [adminWorkPlaces, setAdminWorkPlaces] = useState(initialAdminWorkPlaces);

  useEffect(() => {
    setAdminWorkPlaces(initialAdminWorkPlaces);
  }, [initialAdminWorkPlaces]);

  useEffect(() => {
    if (!isOpen || initialAdminWorkPlaces.length > 0) return;

    const loadAdminWorkPlaces = async () => {
      try {
        const workPlaces = await getAdminWorkPlaceList(toast);
        setAdminWorkPlaces(workPlaces);
      } catch (err) {
        notify(toast, {
          title: "관리자 근무지 목록을 불러오지 못했습니다.",
          description: err?.message,
          status: "error",
        });
      }
    };

    loadAdminWorkPlaces();
  }, [initialAdminWorkPlaces.length, isOpen, toast]);

  return adminWorkPlaces;
}
