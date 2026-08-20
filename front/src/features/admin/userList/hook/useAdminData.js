import { useEffect } from "react";

import { fetchEmployees } from "../api/admnsdbPost";

export function useAdminData(setPeopleData) {
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchEmployees();
        if (res?.success && Array.isArray(res.users)) {
          setPeopleData(res.users);
        }
      } catch (err) {
        console.error("데이터 로딩 실패", err);
      }
    };

    load();
  }, [setPeopleData]);
}
