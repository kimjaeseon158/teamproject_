export function sortEmployees(people, { field, direction }) {
  if (!field) return people;
  return [...people].sort((a, b) => {
    const normalize = (value) => field === "phone_number" ? String(value || "").replace(/\D/g, "") : String(value || "");
    return normalize(a[field]).localeCompare(normalize(b[field]), "ko", { numeric: true }) * (direction === "desc" ? -1 : 1);
  });
}
