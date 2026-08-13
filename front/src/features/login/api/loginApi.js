import { ApiPost } from "../../../services/api/requestJson";
import { ERROR_MESSAGES, getErrorMessage } from "../../../constants/errorMessages";

const normalizeLoginError = (error) => ({
  success: false,
  message: getErrorMessage(error, ERROR_MESSAGES.login.invalidCredentials),
  status: error?.status,
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
