import { googleLoginUrl } from "./googleApiConfig";

const GOOGLE_EXPORT_RETURN_PATH = "googleExportReturnPath";

export function login(returnPath = window.location.pathname) {
  sessionStorage.setItem(GOOGLE_EXPORT_RETURN_PATH, returnPath);
  window.location.assign(`${googleLoginUrl}/`);
}

export const getGoogleExportReturnPath = () =>
  sessionStorage.getItem(GOOGLE_EXPORT_RETURN_PATH);

export const consumeGoogleExportReturnPath = (currentPath) => {
  const returnPath = getGoogleExportReturnPath();
  if (!returnPath || returnPath !== currentPath) return false;

  sessionStorage.removeItem(GOOGLE_EXPORT_RETURN_PATH);
  return true;
};
