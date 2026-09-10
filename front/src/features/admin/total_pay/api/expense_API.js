import { ApiPatch, ApiPost } from "../../../../services/api/requestJson";

export async function createExpense(payload, toast) {
  try {
    return await ApiPost("/api/expense-add/", payload, { toast });
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

export async function updateExpense(payload, toast) {
  try {
    return await ApiPatch("/api/expense-update/", payload, { toast });
  } catch (err) {
    toast?.({
      title: "지출 수정 실패",
      description: err.message,
      status: "error",
      duration: 3000,
      isClosable: true,
    });
    return null;
  }
}
