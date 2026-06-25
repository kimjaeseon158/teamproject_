import { fetchWithAuth } from "../../../../services/api/fetchWithAuth";

export async function getAdminWorkPlaceList(toast) {
  const res = await fetchWithAuth(
    "/api/admin-work-place-list-create/",
    { method: "GET" },
    { toast }
  );

  if (!res) return [];

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      data.detail || data.message || "愿由ъ옄 洹쇰Т吏 紐⑸줉 議고쉶???ㅽ뙣?덉뒿?덈떎."
    );
  }

  return Array.isArray(data.work_places) ? data.work_places : [];
}

export async function createAdminWorkPlace(payload, toast) {
  const res = await fetchWithAuth(
    "/api/admin-work-place-list-create/",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    { toast }
  );

  if (!res) throw new Error("?몄쬆 媛깆떊???ㅽ뙣?덉뒿?덈떎.");

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      data.detail || data.message || "愿由ъ옄 洹쇰Т吏 ?깅줉???ㅽ뙣?덉뒿?덈떎."
    );
  }

  return data;
}

export async function updateAdminWorkPlace(payload, toast) {
  const res = await fetchWithAuth(
    "/api/admin-work-place-update-delete/",
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    { toast }
  );

  if (!res) throw new Error("인증 갱신에 실패했습니다.");

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      data.detail || data.message || "관리자 근무지 수정에 실패했습니다."
    );
  }

  return data;
}

export async function deleteAdminWorkPlace(adminWorkPlaceUuid, toast) {
  const res = await fetchWithAuth(
    "/api/admin-work-place-update-delete/",
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_work_place_uuid: adminWorkPlaceUuid }),
    },
    { toast }
  );

  if (!res) throw new Error("인증 갱신에 실패했습니다.");

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      data.detail || data.message || "관리자 근무지 삭제에 실패했습니다."
    );
  }

  return data;
}

