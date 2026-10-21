import { ApiPost } from "../../../services/api/requestJson";
import { ERROR_MESSAGES, getErrorMessage } from "../../../constants/errorMessages";

const normalizeLoginError = (error) => ({
  success: false,
  message: getErrorMessage(error, ERROR_MESSAGES.login.invalidCredentials),
  status: error?.status,
  failed_login_attempts:
    typeof error?.data?.failed_login_attempts === "number"
      ? error.data.failed_login_attempts
      : undefined,
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
