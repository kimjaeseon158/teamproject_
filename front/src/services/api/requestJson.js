import { fetchWithAuth } from "./fetchWithAuth";

export const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (typeof value === "string" && value.trim() === "") return false;
      return true;
    })
  );

export const toQueryString = (params = {}) => {
  const query = new URLSearchParams(cleanParams(params)).toString();
  return query ? `?${query}` : "";
};

export async function requestJson(
  url,
  { method = "GET", body, headers, toast } = {}
) {
  const res = await requestApiResponse(url, { method, body, headers, toast });
  if (!res) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      data.detail || data.message || data.error || "API 요청에 실패했습니다.";
    throw new Error(message);
  }

  return data;
}

export async function requestApiResponse(
  url,
  { method = "GET", body, headers, toast } = {}
) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  return await fetchWithAuth(url, options, { toast });
}

export const ApiGet = (url, { toast, headers } = {}) =>
  requestJson(url, { method: "GET", toast, headers });

export const ApiPost = (url, body, { toast, headers } = {}) =>
  requestJson(url, { method: "POST", body, toast, headers });

export const ApiPatch = (url, body, { toast, headers } = {}) =>
  requestJson(url, { method: "PATCH", body, toast, headers });

export const ApiDelete = (url, body, { toast, headers } = {}) =>
  requestJson(url, { method: "DELETE", body, toast, headers });

export const ApiRawGet = (url, { toast, headers } = {}) =>
  requestApiResponse(url, { method: "GET", toast, headers });

export const ApiRawDelete = (url, body, { toast, headers } = {}) =>
  requestApiResponse(url, { method: "DELETE", body, toast, headers });
