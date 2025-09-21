export const deleteEmployees = async (employee_Numbers) => {
  try {
    const results = []; // 각 사원의 삭제 결과 저장
    const deleted_Users = []; // 삭제된 유저 데이터 저장
    const failed = []; // 실패한 요청들 저장

    for (const empNo of employee_Numbers) {
      const body = {
          employee_number: empNo, // 서버에서 요구하는 구조
      };

      console.log("DELETE 요청 바디:", body);

      const response = await fetch("/api/user_info_delete/", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        credentials: "include"
      });

      const text = await response.text();
      console.log(`사원번호 ${empNo} 삭제 응답 본문:\n`, text);

      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        console.error(`사원번호 ${empNo} 응답이 JSON이 아닙니다.`, e);
        failed.push({
          employee_number: empNo,
          error: "응답 JSON 파싱 실패",
        });
        continue;
      }

    const success = parsed?.success;
    const userData = parsed?.user_data || [];


      if (success) {
        console.log(` ${empNo} 삭제 성공`);
        deleted_Users.push(...userData); // 여러 명 삭제되었을 수도 있음
        results.push({ employee_number: empNo, success: true });
      } else {
        console.warn(`${empNo} 삭제 실패`);
        failed.push({
          employee_number: empNo,
          success: false,
          message: parsed?.data?.message || "알 수 없는 실패",
        });
        results.push({ employee_number: empNo, success: false });
      }
    }

    if (failed.length > 0) {
      return {
        success: false,
        failedItems: failed,
        deleted_Users,
        allResults: results,
      };
    }
    return {
      success: true,
      deleted_Users,
      allResults: results,
    };
  } catch (err) {
    console.error("삭제 중 예외 발생:", err);
    return { success: false, error: err.message };
  }
};
