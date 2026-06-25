// src/js/total_payPost.js
import { fetchWithAuth } from "../../../../services/api/fetchWithAuth";

export async function expense_Data(payload, toast) {
  try {
    // fetchWithAuth ?¸ì¶œ
    const res = await fetchWithAuth(
      " /api/expense-add/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      { toast } // ?µì…˜?¼ë¡œ toast ?˜ê?
    );

    if (!res) return null; // refresh ?¤íŒ¨ ??null ë°˜í™˜

    const data = await res.json();
    return data;
  } catch (err) {
    if (toast) {
      toast({
        title: "?¤íŠ¸?Œí¬ ?¤ë¥˜",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    return null;
  }
}
