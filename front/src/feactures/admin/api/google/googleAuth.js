export function login() {
  // ✅ Django OAuth 시작 (redirect)
  window.location.href = "/api/google_calendar_auth/";
}
