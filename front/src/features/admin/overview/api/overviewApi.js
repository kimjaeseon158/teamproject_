import { getAdminWorkPlaceList } from "../../work_place/api/adminWorkPlace";
import { getAdminWorkDays } from "../../work_day/api/adminWorkday";

const toYMD = (target) => {
  const y = target.getFullYear();
  const m = String(target.getMonth() + 1).padStart(2, "0");
  const day = String(target.getDate()).padStart(2, "0");

  return `${y}-${m}-${day}`;
};

export const getMonthRange = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();

  return {
    startDate: toYMD(new Date(year, month, 1)),
    endDate: toYMD(new Date(year, month + 1, 0)),
  };
};

export const fetchOverviewWorkPlaces = async ({ toast } = {}) =>
  await getAdminWorkPlaceList(toast);

export const fetchOverviewPendingWorkDays = async (currentDate, { toast } = {}) => {
  const { startDate, endDate } = getMonthRange(currentDate);

  return await getAdminWorkDays(
    {
      status: "대기",
      start_date_str: startDate,
      end_date_str: endDate,
    },
    { toast }
  );
};
