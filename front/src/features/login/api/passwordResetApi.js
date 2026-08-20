import { ApiPost } from "../../../services/api/requestJson";

export async function requestPasswordReset({ userId, residentNumber }) {
  const data = await ApiPost("/api/user-password-reset-request/", {
    user_id: userId.trim(),
    resident_number: residentNumber,
  });

  return { ...data, accepted: true };
}
