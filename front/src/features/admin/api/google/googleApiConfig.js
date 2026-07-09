const normalizeBaseUrl = (url) => url.replace(/\/+$/, "");

export const googleAuthBaseUrl = normalizeBaseUrl(
  process.env.REACT_APP_GOOGLE_AUTH_URL ||
    "http://localhost:8000/api/google-calendar-auth/"
);

export const googleAuthStartUrl = `${googleAuthBaseUrl}/`;
export const googleEventsUrl = `${googleAuthBaseUrl}/events/`;
