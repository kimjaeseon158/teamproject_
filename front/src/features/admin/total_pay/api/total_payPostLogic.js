import { ApiGet, toQueryString } from "../../../../services/api/requestJson";

export async function total_payPost(payload, toast) {
  try {
    return await ApiGet(`/api/finance-total/${toQueryString(payload)}`, {
      toast,
    });
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
