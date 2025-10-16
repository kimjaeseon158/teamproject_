export function login() {
  // ✅ 프론트엔드는 Google 로그인 페이지로 바로 리디렉션만 담당
  // 나머지 OAuth 로직(토큰 교환 등)은 전부 Django에서 처리
  window.location.href = "http://localhost:8000/api/google_calendar_auth/";
}