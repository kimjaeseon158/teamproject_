const normalizeBaseUrl = (url) => url.replace(/\/+$/, "");

export const googleLoginUrl = normalizeBaseUrl(
  process.env.REACT_APP_GOOGLE_LOGIN_URL ||
    "http://localhost:8000/api/google/login/"
);

export const googleCalendarEventsUrl = "/api/google/calendar/events/";
