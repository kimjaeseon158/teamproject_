export const calculateDurationInHours = (start, finish) => {
  const [startH, startM] = start.split(":").map(Number);
  const [finishH, finishM] = finish.split(":").map(Number);

  const startTotalMinutes = startH * 60 + startM;
  const finishTotalMinutes = finishH * 60 + finishM;

  let duration = finishTotalMinutes - startTotalMinutes;

  // 점심시간 범위
  const lunchStart = 12 * 60; // 12:00
  const lunchEnd = 13 * 60;   // 13:00

  // 점심시간이 작업 시간 범위에 겹치는지 체크
  const isLunchIncluded = startTotalMinutes < lunchEnd && finishTotalMinutes > lunchStart;

  if (isLunchIncluded) {
    duration -= 60; // 1시간 차감
  }

  return duration > 0 ? duration / 60 : 0;
};
export const convertHoursToHMS = (floatHours) => {
  const hours = Math.floor(floatHours);
  const minutes = Math.floor((floatHours - hours) * 60);
  const seconds = Math.round(((floatHours - hours) * 60 - minutes) * 60);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export const calculateDurationInHM = (start, end) => {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);

  const startDate = new Date(0, 0, 0, sh, sm);
  const endDate = new Date(0, 0, 0, eh, em);

  let diffMs = endDate - startDate;

  if (diffMs <= 0) return "";

  const diffMinsTotal = Math.floor(diffMs / 1000 / 60);
  let diffMins = diffMinsTotal;

  // 5시간(300분) 이상이면 1시간(60분) 차감
  if (diffMinsTotal >= 300) {
    diffMins -= 60;
  }

  if (diffMins <= 0) return "";

  const hours = Math.floor(diffMins / 60);
  const minutes = diffMins % 60;

  return `${hours > 0 ? `${hours}시간` : ""} ${minutes > 0 ? `${minutes}분` : ""}`.trim();
};
