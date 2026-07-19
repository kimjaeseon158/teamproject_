const REQUEST_HEADERS_TO_REMOVE = new Set([
  "connection",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "x-forwarded-host",
  "x-forwarded-proto",
  "x-vercel-id",
]);

const RESPONSE_HEADERS_TO_REMOVE = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "set-cookie",
  "transfer-encoding",
]);

module.exports = async function handler(req, res) {
  const backendBaseUrl = getBackendBaseUrl();

  if (!backendBaseUrl) {
    res.status(500).json({ error: "Backend proxy is not configured" });
    return;
  }

  const targetUrl = buildTargetUrl(backendBaseUrl, req.url);

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: buildRequestHeaders(req.headers),
      body: hasRequestBody(req.method) ? req : undefined,
      redirect: "manual",
      duplex: hasRequestBody(req.method) ? "half" : undefined,
    });

    copyResponseHeaders(response.headers, res);
    copySetCookieHeaders(response.headers, res);

    const body = Buffer.from(await response.arrayBuffer());
    res.status(response.status).send(body);
  } catch (error) {
    console.error("Backend proxy request failed", error);
    res.status(502).json({ error: "Backend proxy failed" });
  }
};

module.exports.config = {
  api: {
    bodyParser: false,
  },
};

function getBackendBaseUrl() {
  const value = (process.env.BACKEND_BASE_URL || "").trim();

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (url.username || url.password || url.search || url.hash) return null;
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

function buildTargetUrl(backendBaseUrl, requestUrl) {
  const incomingUrl = new URL(requestUrl, "http://vercel-proxy.local");
  return `${backendBaseUrl}${incomingUrl.pathname}${incomingUrl.search}`;
}

function buildRequestHeaders(requestHeaders) {
  const headers = new Headers();

  Object.entries(requestHeaders).forEach(([name, value]) => {
    const lowerName = name.toLowerCase();
    if (REQUEST_HEADERS_TO_REMOVE.has(lowerName) || lowerName.startsWith("x-vercel-")) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => headers.append(name, item));
    } else if (value !== undefined) {
      headers.set(name, value);
    }
  });

  return headers;
}

function hasRequestBody(method = "GET") {
  return !["GET", "HEAD"].includes(method.toUpperCase());
}

function copyResponseHeaders(headers, res) {
  headers.forEach((value, name) => {
    if (!RESPONSE_HEADERS_TO_REMOVE.has(name.toLowerCase())) {
      res.setHeader(name, value);
    }
  });
}

function copySetCookieHeaders(headers, res) {
  const cookies =
    typeof headers.getSetCookie === "function"
      ? headers.getSetCookie()
      : headers.get("set-cookie")
        ? [headers.get("set-cookie")]
        : [];

  if (cookies.length > 0) {
    res.setHeader("set-cookie", cookies);
  }
}
