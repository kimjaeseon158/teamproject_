import { googleAuthStartUrl } from "./googleApiConfig";

export function login() {
  sessionStorage.setItem("oauthInFlight", "1");
  sessionStorage.removeItem("oauthDone");
  window.location.href = googleAuthStartUrl;
}
