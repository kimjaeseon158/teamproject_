import { googleLoginUrl } from "./googleApiConfig";

export function login() {
  window.location.assign(`${googleLoginUrl}/`);
}
