import { ApiGet } from "../../../services/api/requestJson";

export const normalizeUserWorkPlaces = (workPlaces) => {
  if (!Array.isArray(workPlaces)) return [];

  const names = workPlaces
    .map((workPlace) => {
      if (typeof workPlace === "string") return workPlace;
      return workPlace?.work_place ?? "";
    })
    .filter(Boolean);

  return Array.from(new Set(names));
};

export const fetchUserWorkPlaces = async ({ toast } = {}) => {
  const data = await ApiGet("/api/user-work-places/", { toast });
  return normalizeUserWorkPlaces(data?.work_places);
};
