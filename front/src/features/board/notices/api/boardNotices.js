import {
  ApiDelete,
  ApiGet,
  ApiPatch,
  ApiPost,
  toQueryString,
} from "../../../../services/api/requestJson";

const getBasePath = (loginType) =>
  loginType === "admin" ? "/api/admin/notices" : "/api/user/notices";

const normalizeNotice = (notice = {}) => ({
  notice_uuid: notice.notice_uuid || "",
  title: notice.title || "",
  content: notice.content || "",
  author_type: notice.author_type || "",
  author_name: notice.author_name || "",
  created_at: notice.created_at || "",
  updated_at: notice.updated_at || "",
});

export async function fetchNotices(
  { loginType, title = "", author = "", page = 1 },
  options = {}
) {
  const data = await ApiGet(
    `${getBasePath(loginType)}/${toQueryString({ title, author, page })}`,
    options
  );
  return {
    count: Number(data?.count) || 0,
    next: data?.next || null,
    previous: data?.previous || null,
    results: Array.isArray(data?.results)
      ? data.results.map(normalizeNotice)
      : [],
  };
}

export const fetchNotice = async ({ loginType, noticeUuid }, options = {}) =>
  normalizeNotice(
    await ApiGet(`${getBasePath(loginType)}/${noticeUuid}/`, options)
  );

export const createNotice = ({ loginType, values }, options = {}) =>
  ApiPost(`${getBasePath(loginType)}/`, values, options);

export const updateNotice = (
  { loginType, noticeUuid, values },
  options = {}
) => ApiPatch(`${getBasePath(loginType)}/${noticeUuid}/`, values, options);

export const deleteNotice = ({ loginType, noticeUuid }, options = {}) =>
  ApiDelete(`${getBasePath(loginType)}/${noticeUuid}/`, undefined, options);

export const markNoticeRead = ({ noticeUuid }, options = {}) =>
  ApiPost(`/api/user/notices/${noticeUuid}/read/`, {}, options);
