import { ApiDelete } from "../../../../services/api/requestJson";

export const deleteEmployees = async (userUuids, { toast } = {}) => {
  try {
    if (!Array.isArray(userUuids) || userUuids.length === 0) {
      return { success: false, error: "삭제할 대상이 없습니다." };
    }

    const deletedUsers = [];

    for (const uuid of userUuids) {
      const result = await ApiDelete(
        "/api/user-info-delete/",
        { user_uuid: uuid },
        { toast }
      );

      if (result?.success) {
        deletedUsers.push(uuid);
      }
    }

    return { success: true, deletedUsers };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
