import { ApiGet, toQueryString } from "../../../../services/api/requestJson";

export async function expense_filter_Data({ start, end }, toast) {
  try {
    const startStr = start.toISOString().split("T")[0];
    const endStr = end.toISOString().split("T")[0];

    return await ApiGet(
      `/api/expense-filtered/${toQueryString({
        start_date: startStr,
        end_date: endStr,
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
