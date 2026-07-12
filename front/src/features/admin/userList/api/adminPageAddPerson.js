import { ApiPatch } from "../../../../services/api/requestJson";

export const AddUser_PostData = async (data, { toast } = {}) => {
  try {
    return await ApiPatch("/api/user-info-add/", data, { toast });
  } catch (error) {
    console.error("서버 전송 오류", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
