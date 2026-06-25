// src/js/total_payPost.js
import { fetchWithAuth } from "../../../../services/api/fetchWithAuth";

export async function income_Data(payload, toast) {
  try {
    const res = await fetchWithAuth(
      "/api/income-add/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      { toast }
    );

    if (!res) return null; // ?∏Ï¶ù/?§Ìä∏?åÌÅ¨ Î¨∏Ï†ú ??
    const data = await res.json();
    return data;
  } catch (err) {
    if (toast) {
      toast({
        title: "?§Ìä∏?åÌÅ¨ ?§Î•ò",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    return null;
  }
}
