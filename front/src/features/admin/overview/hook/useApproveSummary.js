import { useMemo } from "react";

export default function useApproveSummary(workDays = []) {
  return useMemo(() => {
    const summary = {
      total: 0,
      day: 0,
      night: 0,
      special: 0,
      users: {},
    };

    workDays.forEach((item) => {
      if (item.is_approved !== null) return;

      summary.total += 1;

      if (item.work_shift === "주간") summary.day += 1;
      if (item.work_shift === "야간") summary.night += 1;
      if (String(item.work_shift || "").includes("특근")) summary.special += 1;

      const key = item.user_uuid;

      if (!summary.users[key]) {
        summary.users[key] = {
          user_uuid: item.user_uuid,
          user_name: item.user_name,
          count: 0,
        };
      }

      summary.users[key].count += 1;
    });

    return {
      total: summary.total,
      day: summary.day,
      night: summary.night,
      special: summary.special,
      users: Object.values(summary.users),
    };
  }, [workDays]);
}
