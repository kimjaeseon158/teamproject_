import { ApiPatch } from "../../../services/api/requestJson";

export async function changeUserPassword(
  { currentPassword, newPassword, newPasswordConfirm },
  { toast } = {}
) {
  try {
    const data = await ApiPatch(
      "/api/user-password-change/",
      {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      },
      { toast }
    );

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || "비밀번호 변경에 실패했습니다.",
    };
  }
}
