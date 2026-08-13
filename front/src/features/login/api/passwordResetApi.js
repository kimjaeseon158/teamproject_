export async function requestPasswordReset({ userId, residentNumber }) {
  const response = await fetch("/api/user-password-reset-request/", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId.trim(),
      resident_number: residentNumber,
    }),
  });

  const data = await response.json().catch(() => ({}));
  const accepted = response.status === 202 || (response.ok && data?.success !== false);
  if (!accepted) {
    const error = new Error(data.message || data.error);
    error.status = response.status;
    throw error;
  }
  return { ...data, accepted: true };
}
