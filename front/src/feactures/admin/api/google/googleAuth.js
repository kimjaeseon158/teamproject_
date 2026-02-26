export function login() {
  // ✅ Django OAuth 시작 (redirect)
  window.location.href = "http://localhost:8000/api/google_calendar_auth/";
}
