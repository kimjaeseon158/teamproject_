import Holidays from "date-holidays";

const holidayYearCache = new Map();
const holidayInfoYearCache = new Map();
const koreanHolidays = new Holidays("KR");

export const toHolidayDateString = (value) => {
  const date = String(value ?? "");
  if (/^\d{8}$/.test(date)) {
    return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
  }

  const match = date.match(/^(\d{4}-\d{2}-\d{2})/);
  return match?.[1] || null;
};

const fetchHolidayYear = (year) => {
  const yearKey = String(year);
  const cached = holidayYearCache.get(yearKey);
  if (cached) return Promise.resolve(cached);

  const dates = new Set(
    koreanHolidays
      .getHolidays(Number(yearKey))
      .filter(({ type }) => type === "public")
      .map(({ date }) => toHolidayDateString(date))
      .filter(Boolean)
  );

  holidayYearCache.set(yearKey, dates);
  return Promise.resolve(dates);
};

const getHolidayInfoForYear = (year) => {
  const yearKey = String(year);
  const cached = holidayInfoYearCache.get(yearKey);
  if (cached) return cached;

  const holidayInfo = new Map(
    koreanHolidays
      .getHolidays(Number(yearKey))
      .filter(({ type }) => type === "public")
      .map((holiday) => [toHolidayDateString(holiday.date), holiday])
      .filter(([date]) => Boolean(date))
  );

  holidayInfoYearCache.set(yearKey, holidayInfo);
  return holidayInfo;
};

export const getAutomaticSpecialDay = (dateString) => {
  const normalizedDate = toHolidayDateString(dateString);
  if (!normalizedDate) {
    return { isAutomatic: false, isHoliday: false, isWeekend: false, name: "" };
  }

  const [year, month, day] = normalizedDate.split("-").map(Number);
  const dayOfWeek = new Date(year, month - 1, day).getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const holiday = getHolidayInfoForYear(year).get(normalizedDate);

  return {
    isAutomatic: isWeekend || Boolean(holiday),
    isHoliday: Boolean(holiday),
    isWeekend,
    name: holiday?.name || "",
  };
};

export const getHolidayDates = async (years) => {
  const uniqueYears = [...new Set(years.map(String))];
  const yearlyDates = await Promise.all(uniqueYears.map(fetchHolidayYear));

  return new Set(yearlyDates.flatMap((dates) => [...dates]));
};

