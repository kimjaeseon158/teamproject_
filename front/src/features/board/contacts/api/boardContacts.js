import { ApiGet, toQueryString } from "../../../../services/api/requestJson";

const normalizeContacts = (contacts) => (Array.isArray(contacts) ? contacts : [])
  .map((contact) => ({
    user_name: contact?.user_name || "",
    phone_number: contact?.phone_number || "",
  }))
  .filter((contact) => contact.user_name)
  .sort((a, b) => a.user_name.localeCompare(b.user_name, "ko"));

export const fetchBoardContacts = async ({ loginType, name = "" }, { toast } = {}) => {
  const trimmedName = name.trim();

  if (loginType === "admin") {
    const response = await ApiGet(
      `/api/user-info-filtering/${toQueryString({ user_name: trimmedName })}`,
      { toast }
    );
    return normalizeContacts(response?.data);
  }

  const response = await ApiGet(
    `/api/user-contacts/${toQueryString({ name: trimmedName })}`,
    { toast }
  );
  return normalizeContacts(response?.contacts);
};
