export const deleteEmployee = async (employeeNumber) => {
  try {
    const body = {
      data_type: "user_info_delete",
      data: { employee_number: employeeNumber },
    };

    const response = await fetch("http://127.0.0.1:8000/api/items/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`서버 오류: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log("서버 응답:", result);

    if (!result.data?.success) {
      return { success: false, message: result.data?.message || "삭제 실패", user_data: [] };
    }

    return {
      success: true,
      message: result.data.message || "삭제 성공",
      user_data: result.data.user_data || [],
    };
  } catch (error) {
    console.error("삭제 요청 에러:", error);
    return { success: false, message: error.message, user_data: [] };
  }
};
