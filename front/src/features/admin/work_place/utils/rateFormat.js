export const formatWon = (value) => {
  if (value == null || value === "" || Number.isNaN(Number(value))) return "-";
  return `${Number(value).toLocaleString()}원`;
};

export const toNumberOrNull = (value) => {
  if (value === "" || value == null) return null;
  const normalized = String(value).replaceAll(",", "");
  return Number.isNaN(Number(normalized)) ? null : Number(normalized);
};

export const average = (values) => {
  const valid = values.filter((value) => value !== "" && value != null);
  if (!valid.length) return null;

  return Math.round(
    valid.reduce((sum, value) => sum + Number(value), 0) / valid.length
  );
};

export const averageWithFallback = (rows, key, fallbackKey) =>
  average(rows.map((row) => row[key] ?? row[fallbackKey]));

export const notify = (toast, options) => {
  toast({
    duration: 2500,
    isClosable: true,
    position: "top-right",
    ...options,
  });
};
