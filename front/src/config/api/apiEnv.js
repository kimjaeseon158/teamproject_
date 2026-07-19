const rawApiBase = (process.env.REACT_APP_API_BASE_URL || "").trim();
const rawWsBase = (process.env.REACT_APP_WS_BASE_URL || "").trim();

const isHttpsPage =
  typeof window !== "undefined" && window.location.protocol === "https:";

const usesInsecureHttp = (url) => url.toLowerCase().startsWith("http://");
const usesInsecureWebSocket = (url) =>
  url.toLowerCase().startsWith("ws://");

export const API_BASE =
  isHttpsPage && (!rawApiBase || usesInsecureHttp(rawApiBase))
    ? ""
    : rawApiBase.replace(/\/$/, "");

export const WS_BASE =
  !rawWsBase || (isHttpsPage && usesInsecureWebSocket(rawWsBase))
    ? ""
    : rawWsBase.replace(/\/$/, "");

export const WS_ENABLED = Boolean(WS_BASE);
