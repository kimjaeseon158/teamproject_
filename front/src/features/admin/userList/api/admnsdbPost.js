import { ApiGet, toQueryString } from "../../../../services/api/requestJson";

export const Panel_PostData = async (data = {}, toast) => {
  try {
    return await ApiGet(`/api/user-info-list/${toQueryString(data)}`, {
      toast,
    });
  } catch (error) {
    if (toast) {
      toast({
        title: "직원 정보 조회 실패",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    return null;
  }
};
