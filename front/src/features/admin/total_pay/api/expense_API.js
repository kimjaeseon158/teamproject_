import { ApiPost } from "../../../../services/api/requestJson";

export async function expense_Data(payload, toast) {
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
