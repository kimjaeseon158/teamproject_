import { ApiPatch, ApiPost } from "../../../../services/api/requestJson";

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

export const createEmployeesBulk = async (employees, { toast } = {}) => {
  try {
    return await ApiPost("/api/user-info-bulk-add/", employees, { toast });
  } catch (error) {
    console.error("직원 일괄등록 오류", error);
    return { saved_count: 0, failed_count: employees.length, error: error.message, errors: error.data?.errors };
  }
};
