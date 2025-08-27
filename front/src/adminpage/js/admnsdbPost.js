export const Panel_PostData = async (data) => {
  try {
    const response = await fetch("/api/user_login_info/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data), // wages 객체를 직접 전송
      credentials: "include"
    });

    const result = await response.json();
    console.log("서버 응답:", result);
    return result;
  } catch (error) {
    console.error("서버 전송 오류:", error);
    throw error;
  }
};