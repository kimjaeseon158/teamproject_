export const toMonthValue = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

export const getMonthRange = (monthValue) => {
  const [year, month] = String(monthValue || "").split("-").map(Number);

  if (!year || !month) {
    return { from: undefined, to: undefined };
  }

  return {
    from: new Date(year, month - 1, 1),
    to: new Date(year, month, 0),
  };
};
