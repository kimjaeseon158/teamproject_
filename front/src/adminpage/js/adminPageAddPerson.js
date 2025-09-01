export const AddUser_PostData = async (data) => {
  try {
    const response = await fetch("/api/add_user/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data)
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("서버 전송 오류:", error);
    throw error;
  }
};
