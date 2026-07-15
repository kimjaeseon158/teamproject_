const BACKEND_BASE_URL = (process.env.BACKEND_BASE_URL || "").replace(/\/$/, "");

module.exports = async function handler(req, res) {
  if (!BACKEND_BASE_URL) {
    res.status(500).json({ error: "BACKEND_BASE_URL is not configured" });
    return;
  }

  const targetUrl = `${BACKEND_BASE_URL}${buildBackendPath(req)}`;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: buildHeaders(req),
      body: buildBody(req),
      redirect: "manual",
    });

    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "content-encoding") {
        res.setHeader(key, value);
      }
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    res.status(response.status).send(buffer);
  } catch (error) {
    res.status(502).json({
      error: "Backend proxy failed",
      message: error.message,
    });
  }
};

function buildHeaders(req) {
  const headers = {};
  const allowedHeaders = ["accept", "authorization", "content-type", "cookie"];

  allowedHeaders.forEach((key) => {
    const value = req.headers[key];
    if (value) headers[key] = value;
  });

  return headers;
}

function buildBody(req) {
  if (["GET", "HEAD"].includes(req.method)) return undefined;
  if (req.body === undefined || req.body === null) return undefined;
  if (Buffer.isBuffer(req.body) || typeof req.body === "string") return req.body;
  return JSON.stringify(req.body);
}

function buildBackendPath(req) {
  const rawPath = Array.isArray(req.query.path)
    ? req.query.path.join("/")
    : req.query.path || "";
  const path = rawPath.startsWith("/") ? rawPath : `/api/${rawPath}`;
  const [pathname, queryString = ""] = path.split("?");
  const normalizedPath = pathname.endsWith("/") ? pathname : `${pathname}/`;
  const extraQueryString = buildQueryString(req.query);
  const joinedQueryString = [queryString, extraQueryString]
    .filter(Boolean)
    .join("&");

  return joinedQueryString
    ? `${normalizedPath}?${joinedQueryString}`
    : normalizedPath;
}

function buildQueryString(query) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (key === "path") return;
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
      return;
    }
    if (value !== undefined) {
      params.append(key, value);
    }
  });

  return params.toString();
}
