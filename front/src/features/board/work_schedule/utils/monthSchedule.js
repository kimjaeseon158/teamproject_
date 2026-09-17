import { addDaysToDateValue, toLocalDateValue } from "../../../common/utils/dateValue";

export function monthDates(month) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month || "")) return [];
  const [year, number] = month.split("-").map(Number);
  const count = new Date(year, number, 0).getDate();
  return Array.from({ length: count }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`);
}

export function monthWeekStarts(month) {
  const dates = monthDates(month);
  return [...new Set(dates.map((date) => {
    const day = new Date(`${date}T00:00:00`).getDay();
    return addDaysToDateValue(date, -((day + 6) % 7));
  }))];
}

export function shiftMonth(month, amount) {
  const [year, number] = month.split("-").map(Number);
  return toLocalDateValue(new Date(year, number - 1 + amount, 1)).slice(0, 7);
}

export function mergeMonthSchedules(month, responses) {
  const dates = monthDates(month);
  const allowed = new Set(dates);
  const users = new Map();
  responses.forEach((response) => (response.users || []).forEach((user) => {
    const target = users.get(user.user_uuid) || { ...user, days: {} };
    Object.entries(user.days || {}).forEach(([date, items]) => {
      if (!allowed.has(date)) return;
      const existing = target.days[date] || [];
      const ids = new Set(existing.map((item) => item.schedule_uuid).filter(Boolean));
      // Weekly requests own distinct dates. Overlapping responses must not duplicate them.
      target.days[date] = target.days[date]
        ? [...existing, ...items.filter((item) => item.schedule_uuid && !ids.has(item.schedule_uuid))]
        : [...items];
    });
    users.set(user.user_uuid, target);
  }));
  return { dates, users: [...users.values()] };
}

export function filterDateUsers(users, date, keyword, status) {
  const query = keyword.trim().toLowerCase();
  return users.flatMap((user) => {
    const items = (user.days?.[date] || []).filter((item) =>
      (status === "ALL" || item.status === status)
      && (!query || [user.user_name, item.work_place, item.work_place_detail]
        .some((value) => value?.toLowerCase().includes(query)))
    );
    return items.length ? [{ ...user, items }] : [];
  });
}
