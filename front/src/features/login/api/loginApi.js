import { ApiPost } from "../../../services/api/requestJson";

const normalizeLoginError = (error) => ({
  success: false,
  message: error?.message || "아이디 또는 비밀번호를 확인해주세요.",
});

export const adminLoginAPI = async (id, password, admin_code) => {
  try {
    return await ApiPost("/api/check-admin-login/", {
      id,
      password,
      admin_code,
    });
  } catch (error) {
    return normalizeLoginError(error);
  }
};

export const userLoginAPI = async (id, password) => {
  try {
    return await ApiPost("/api/check-user-login/", {
      user_id: id,
      password,
    });
  } catch (error) {
    return normalizeLoginError(error);
  }
};
