import { useEffect } from "react";
import { Panel_PostData } from "../api/admnsdbPost";

export function useAdminData(setPeopleData) {
  useEffect(() => {
    const load = async () => {
      try {
        const res = await Panel_PostData();
        if (res?.success && Array.isArray(res.users)) {
          setPeopleData(res.users);
        }
      } catch (err) {
        console.error("데이터 로딩 실패");
      }
    };
    load();
  }, [setPeopleData]);
}
