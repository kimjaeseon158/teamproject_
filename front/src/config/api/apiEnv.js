const rawApiBase = (process.env.REACT_APP_API_BASE_URL || "").trim();
const rawWsBase = (process.env.REACT_APP_WS_BASE_URL || "").trim();

const isBrowser = typeof window !== "undefined";
const isHttpsPage = isBrowser && window.location.protocol === "https:";
const isLocalPage =
  isBrowser &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

const trimTrailingSlash = (value) => value.replace(/\/$/, "");
const isHttpUrl = (value) => value.toLowerCase().startsWith("http://");
const isWsUrl = (value) => value.toLowerCase().startsWith("ws://");
const shouldUseProxy =
  isHttpsPage && !isLocalPage && (!rawApiBase || isHttpUrl(rawApiBase));

export const API_PROXY_BASE = "/api/proxy?path=";
export const API_BASE = shouldUseProxy
  ? API_PROXY_BASE
  : trimTrailingSlash(rawApiBase);

export const WS_BASE_URL =
  isHttpsPage && !isLocalPage && isWsUrl(rawWsBase)
    ? ""
    : trimTrailingSlash(rawWsBase);

export const WS_BASE = WS_BASE_URL;
export const WS_ENABLED = Boolean(WS_BASE_URL);
