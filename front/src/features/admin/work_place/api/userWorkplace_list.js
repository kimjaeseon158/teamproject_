import { ApiGet, toQueryString } from "../../../../services/api/requestJson";
import { EMPTY_PLACE, RATE_FIELDS } from "../constants/rateFields";

const normalizeEmptyRates = (users) => users.map((user) => ({
  ...user,
  rates: (user.rates || []).map((rate) => {
    const isEmptyRate = RATE_FIELDS.every(
      (field) => rate[field.key] == null || rate[field.key] === ""
    );

    return isEmptyRate ? { ...rate, work_place: EMPTY_PLACE } : rate;
  }),
}));

export async function getWorkPlaceList(params = {}, toast) {
  try {
    const query = toQueryString({
      user_name: params.user_name,
      work_place: params.work_place,
    });
    const url = query
      ? `/api/work-place-rate-list-filtering/${query}`
      : "/api/work-place-rate-list-create/";

    const data = await ApiGet(url, { toast });

    return {
      ...data,
      success: data?.success === true || data?.success === "true",
      users: Array.isArray(data?.users) ? normalizeEmptyRates(data.users) : [],
    };
  } catch (err) {
    if (toast) {
      toast({
        title: "네트워크 오류",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    return null;
  }
}
