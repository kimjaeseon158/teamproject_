export const updateEmployee = async (employee_Data) => {
  try {
    const body = {
      data_type: "user_info_update",
      data: employee_Data,
    };

    const response = await fetch("http://localhost:8000/api/items/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    const result = JSON.parse(text);

    if (!response.ok || result.success === false) {
      throw new Error(result?.error || "업데이트 실패");
    }

    return { success: true, updated: result.updated || employee_Data };
  } catch (error) {
    console.error("업데이트 에러:", error);
    return { success: false, error: error.message };
  }
};
