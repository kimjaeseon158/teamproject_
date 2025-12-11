// src/calenderTest/js/submitWorkInfo.js (예시 경로)
import { fetchWithAuth } from "../../api/fetchWithAuth"; // ✅ 경로는 프로젝트 구조에 맞게 수정

const submitWorkInfo = async (
  {
    user,
    employeeNumber,
    selectedDate,
    startTime,
    finishTime,
    totalWorkTime,
    location,
  },
  { toast } = {} // 🔥 필요하면 토스트도 받을 수 있게
) => {
  console.log("🧾 employeeNumber in submitWorkInfo:", employeeNumber);

  const formattedDate =
    selectedDate instanceof Date
      ? selectedDate.toLocaleDateString("ko-KR") // 필요하면 고정 포맷으로
      : `${selectedDate.formatted}`;

  const totalTimeString = totalWorkTime;

  const newRecord = {
    // 🔥 user_name은 보통 문자열이어야 해서 user 객체 전체 말고 이름만 보내는 게 안전
    user_name: user?.user_name || user?.admin_id || String(user),

    work_start: `${formattedDate} ${startTime}:00`,
    work_end: `${formattedDate} ${finishTime}:00`,
    total_time: totalTimeString,
    work_date: formattedDate,
    work_place: location,
    employee_number: employeeNumber,
    state: "status",
  };

  // ✅ 401 → refresh → 재시도까지 자동
  const res = await fetchWithAuth(
    "/api/user_work_info/",
    {
      method: "PATCH", // 🔥 대문자 PATCH로 통일
      headers: {
        // "Content-Type": "application/json",  // fetchWithAuth에서 기본으로 넣어주면 생략 가능
      },
      body: JSON.stringify(newRecord),
    },
    { toast } // 🔥 토스트를 전달하면, fetchWithAuth 안에서 에러 토스트 띄우는 것도 가능
  );

  if (!res.ok) {
    // 필요하면 에러 메시지 파싱
    let errorMsg = "근무 정보 전송 실패";
    try {
      const errData = await res.json();
      errorMsg = errData.detail || JSON.stringify(errData);
    } catch (e) {
      /* ignore */
    }

    console.error("❌ submitWorkInfo 실패:", errorMsg);

    if (toast) {
      toast({
        title: "근무 정보 저장 실패",
        description: errorMsg,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    throw new Error(errorMsg);
  }

  const data = await res.json();
  return { data, newRecord };
};

export default submitWorkInfo;
