// src/login/api/loginApi.js
const API_BASE_URL = "https://teamproject-v2qg.onrender.com";
export const adminLoginAPI = async (id, password, admin_code) => {
  const response = await fetch("/api/check_admin_login/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ id, password, admin_code }),
  });

  return response.json();
};

export const userLoginAPI = async (id, password) => {
  const response = await fetch(`${API_BASE_URL}/api/check_user_login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ user_id: id, password }),
  });

  return response.json();
};
