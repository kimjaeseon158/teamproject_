import { ApiPatch, ApiPost } from "../../../../services/api/requestJson";

export async function createIncome(payload, toast) {
  try {
    return await ApiPost("/api/income-add/", payload, { toast });
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

export async function updateIncome(payload, toast) {
  try {
    return await ApiPatch("/api/income-update/", payload, { toast });
  } catch (err) {
    toast?.({
      title: "수입 수정 실패",
      description: err.message,
      status: "error",
      duration: 3000,
      isClosable: true,
    });
    return null;
  }
}
