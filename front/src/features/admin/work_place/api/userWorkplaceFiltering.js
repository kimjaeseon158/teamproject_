import { ApiGet, toQueryString } from "../../../../services/api/requestJson";

export async function getWorkPlaceFiltering({ user_name, work_place }, toast) {
  try {
    return await ApiGet(
      `/api/work-place-rate-list-filtering/${toQueryString({
        user_name,
        work_place,
      })}`,
      { toast }
    );
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
