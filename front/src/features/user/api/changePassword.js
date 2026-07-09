import { fetchWithAuth } from "../../../services/api/fetchWithAuth";

export async function changeUserPassword(
  { currentPassword, newPassword, newPasswordConfirm },
  { toast } = {}
) {
  const res = await fetchWithAuth(
    "/api/user-password-change/",
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      }),
    },
    { toast }
  );

  if (!res) {
    return {
      success: false,
      message: "인증이 만료되었습니다. 다시 로그인해주세요.",
    };
  }

  let result = null;
  try {
    result = await res.json();
  } catch {
    result = null;
  }

  if (!res.ok || result?.success === false) {
    return {
      success: false,
      message:
        result?.message ||
        result?.detail ||
        result?.error ||
        "비밀번호 변경에 실패했습니다.",
    };
  }

  return {
    success: true,
    data: result,
  };
}
