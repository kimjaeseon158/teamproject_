const googleAuthUrl =
  process.env.REACT_APP_GOOGLE_AUTH_URL ||
  "http://localhost:8000/api/google-calendar-auth/";

export function login() {
  sessionStorage.setItem("oauthInFlight", "1");
  sessionStorage.removeItem("oauthDone");
  window.location.href = googleAuthUrl;
}
