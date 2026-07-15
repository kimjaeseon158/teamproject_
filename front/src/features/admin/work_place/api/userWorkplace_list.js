import { ApiGet, toQueryString } from "../../../../services/api/requestJson";

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
      users: Array.isArray(data?.users) ? data.users : [],
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
