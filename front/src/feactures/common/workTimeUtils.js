export const addMinutesToTime = (time, minutes) => {
  if (!time || !time.includes(":")) return "";
  const [hour, minute] = time.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return "";

  const totalMinutes = hour * 60 + minute + (Number(minutes) || 0);
  const normalizedMinutes = ((totalMinutes % 1440) + 1440) % 1440;
  const nextHour = Math.floor(normalizedMinutes / 60);
  const nextMinute = normalizedMinutes % 60;

  return `${String(nextHour).padStart(2, "0")}:${String(nextMinute).padStart(2, "0")}`;
};

export const getExtraWorkTimes = (type, startTime, finishTime) => {
  if (type === "lunch_ext") {
    return { start: "12:00", finish: "13:00" };
  }

  if (type === "early_arrival" && startTime) {
    return { start: addMinutesToTime(startTime, -120), finish: startTime };
  }

  if (!finishTime) {
    return { start: "", finish: "" };
  }

  return { start: finishTime, finish: addMinutesToTime(finishTime, 120) };
};
