export const deleteEmployees = async (employeeNumbers) => {
  try {
    const results = [];

    for (const empNo of employeeNumbers) {
      const body = {
        data_type: "user_info_delete",
        data:{
            employee_number: empNo, // data 중첩 제거
        }
      };
      console.log("DELETE 요청 바디:", body);

      const response = await fetch("http://localhost:8000/api/items/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const text = await response.text();
      console.log(`사원번호 ${empNo} 삭제 응답 본문:\n`, text);

      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        console.error(`사원번호 ${empNo} 응답이 JSON이 아닙니다.`);
        throw e;
      }

      results.push({ employee_number: empNo, ...result });
    }

    const failed = results.filter((res) => !res.success);
    if (failed.length > 0) {
      console.warn("삭제 실패한 항목:", failed);
      return { success: false, failedItems: failed, allResults: results };
    }

    console.log("삭제 성공한 항목들:", results);
    return { success: true, allResults: results };
  } catch (err) {
    console.error("삭제 중 오류:", err);
    return { success: false, error: err.message };
  }
};
