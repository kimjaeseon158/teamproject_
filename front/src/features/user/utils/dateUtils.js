export const pad2 = (n) => String(n).padStart(2, "0");

export const getTodayInfo = () => {
  const today = new Date();
  return {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
    formatted: `${today.getFullYear()}-${pad2(
      today.getMonth() + 1
    )}-${pad2(today.getDate())}`,
  };
};

export const toDateInfoFromStr = (dateStr) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  return { year: y, month: m, day: d, formatted: dateStr };
};
