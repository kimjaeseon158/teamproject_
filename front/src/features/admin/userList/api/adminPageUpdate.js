import { ApiPatch } from "../../../../services/api/requestJson";

export const updateEmployee = async (employeeData, { toast } = {}) => {
  try {
    if (!employeeData?.user_uuid) {
      return {
        success: false,
        error: "user_uuid가 없는 데이터입니다.",
      };
    }

    const result = await ApiPatch("/api/user-info-update/", employeeData, { toast });

    if (result?.success === false) {
      return {
        success: false,
        error: result?.message || "업데이트 실패",
      };
    }

    return {
      success: true,
      updated: result?.updated_user || employeeData,
      user_data: result?.user_data,
    };
  } catch (error) {
    console.error("업데이트 오류", error);
    return { success: false, error: error.message };
  }
};
