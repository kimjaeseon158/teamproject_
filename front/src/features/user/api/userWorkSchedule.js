import { ApiGet, toQueryString } from "../../../services/api/requestJson";

export const fetchUserWorkSchedule = (
  { date, user_name = "", work_place = "", work_place_detail = "" },
  { toast } = {}
) =>
  ApiGet(
    `/api/user-work-schedule/${toQueryString({
      date,
      user_name: user_name.trim(),
      work_place: work_place.trim(),
      work_place_detail: work_place_detail.trim(),
    })}`,
    { toast }
  );
