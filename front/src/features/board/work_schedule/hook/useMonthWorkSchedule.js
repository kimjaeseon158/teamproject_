import { useCallback, useEffect, useRef, useState } from "react";
import { useUser } from "../../../auth/userContext";
import { fetchUserWorkSchedule } from "../../../user/api/userWorkSchedule";
import { fetchAdminWorkSchedules } from "../../../admin/work_schedule/api/adminWorkSchedules";
import { mergeMonthSchedules, monthWeekStarts } from "../utils/monthSchedule";

export default function useMonthWorkSchedule(month) {
  const { loginType } = useUser();
  const sequence = useRef(0);
  const [state, setState] = useState({ month: null, data: { dates: [], users: [] }, loading: true, error: null });
  const load = useCallback(async () => {
    const id = ++sequence.current;
    setState({ month, data: { dates: [], users: [] }, loading: true, error: null });
    try {
      const responses = await Promise.all(monthWeekStarts(month).map((date) =>
        loginType === "admin" ? fetchAdminWorkSchedules(date) : fetchUserWorkSchedule({ date })
      ));
      if (responses.some((response) => !Array.isArray(response?.users) || !Array.isArray(response?.dates))) {
        throw new Error("월간 근무표 응답을 확인할 수 없습니다.");
      }
      if (id !== sequence.current) return;
      setState({ month, data: mergeMonthSchedules(month, responses), loading: false, error: null });
    } catch (error) {
      if (id !== sequence.current) return;
      setState({ month, data: { dates: [], users: [] }, loading: false, error });
    }
  }, [loginType, month]);

  useEffect(() => {
    load();
    return () => { sequence.current += 1; };
  }, [load]);

  return { ...state, loading: state.loading || state.month !== month, reload: load };
}
