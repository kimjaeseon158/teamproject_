export const updateEmployee = async (employee_Data) => {
  try {
    console.log(employeeData)
    const body = {
      data_type: "user_info_update",
      data: employee_Data,
    };

    const response = await fetch("http://localhost:8000/api/items/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    console.log("업데이트 응답:", result);

    if (!response.ok || result.data?.success === false) {
      throw new Error(result?.data?.message || "업데이트 실패");
    }

    // 여기서 제대로 된 전체 user_data를 꺼냄
    const updatedList = result.data?.user_data;

    if (Array.isArray(updatedList)) {
      return { success: true, updatedList };
    } else {
      return { success: true, updatedList: [] }; // 예외 처리
    }

<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
    return { success: true, updated: result.updated || employee_Data };
>>>>>>> c66fd11173063976473653de3af95a0783d29d5a
>>>>>>> 4b9716fed92023a39aac0c85bae08bca894b0642
  } catch (error) {
    console.error("업데이트 에러:", error);
    return { success: false, error: error.message };
  }
};
