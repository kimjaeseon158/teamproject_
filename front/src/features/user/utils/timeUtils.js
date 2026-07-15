export const minutesToHM = (mins) => {
  const m = Math.max(0, Number(mins) || 0);
  const hours = Math.floor(m / 60);
  const minutes = m % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

export const hmToMinutes = (hm) => {
  if (!hm || !hm.includes(":")) return null;
  const [h, m] = hm.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
};

export const formatTimeInput = (value) => {
  const cleanValue = value.replace(/[^0-9]/g, "");
  if (!cleanValue) return "";
  const hours = cleanValue.slice(0, 2);
  const minutes = cleanValue.slice(2, 4);
  return minutes ? `${hours}:${minutes}` : hours;
};

export const diffMinutes = (startTime, finishTime) => {
  const start = hmToMinutes(startTime);
  const end = hmToMinutes(finishTime);
  if (start == null || end == null) return 0;

  let diff = end - start;
  if (diff < 0) diff += 1440;

  return diff;
};

export const calculateNetMinutes = (startTime, finishTime) => {
  const total = diffMinutes(startTime, finishTime);
  if (total >= 300) {
    return total - 60;
  }
  return total;
};

export const calculateDurationInHours = (start, finish) => {
  const startTotalMinutes = hmToMinutes(start);
  const finishTotalMinutes = hmToMinutes(finish);
  if (startTotalMinutes === null || finishTotalMinutes === null) return 0;

  let duration = diffMinutes(start, finish);
  const lunchStart = 12 * 60;
  const lunchEnd = 13 * 60;

  if (startTotalMinutes < lunchEnd && startTotalMinutes + duration > lunchStart) {
    duration -= 60;
  }

  return Math.max(0, duration / 60);
};

export const convertHoursToHMS = (floatHours) => {
  const minutesTotal = Math.round(floatHours * 60);
  const hours = Math.floor(minutesTotal / 60);
  const minutes = minutesTotal % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:00`;
};

export const calculateDurationInHM = (start, end) => {
  const diffMins = calculateNetMinutes(start, end);
  if (diffMins <= 0) return "";

  const hours = Math.floor(diffMins / 60);
  const minutes = diffMins % 60;

  let result = "";
  if (hours > 0) result += `${hours}시간 `;
  if (minutes > 0) result += `${minutes}분`;
  return result.trim();
};
