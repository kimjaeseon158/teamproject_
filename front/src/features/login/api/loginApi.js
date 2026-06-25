// src/login/api/loginApi.js
export const adminLoginAPI = async (id, password, admin_code) => {
  const response = await fetch("/api/check-admin-login/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ id, password, admin_code }),
  });

  return response.json();
};

export const userLoginAPI = async (id, password) => {
  const response = await fetch(`/api/check-user-login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ user_id: id, password }),
  });

  return response.json();
};
