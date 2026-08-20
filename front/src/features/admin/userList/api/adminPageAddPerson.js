import { ApiPatch } from "../../../../services/api/requestJson";

export const createEmployee = async (employeeData, { toast } = {}) => {
  try {
    return await ApiPatch("/api/user-info-add/", employeeData, { toast });
  } catch (error) {
    console.error("서버 전송 오류", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
