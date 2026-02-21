/* =========================
   format / convert
========================= */

// 분 → HH:mm
export const minutesToHM = (mins) => {
  const m = Math.max(0, Number(mins) || 0);
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(
    m % 60
  ).padStart(2, "0")}`;
};

// HH:mm → 분
export const hmToMinutes = (hm) => {
  if (!hm || !hm.includes(":")) return null;
  const [h, m] = hm.split(":").map(Number);
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : null;
};

// 입력값 숫자만 받아서 HH:mm 형태로
export const formatTimeInput = (v) => {
  const c = v.replace(/[^0-9]/g, "");
  if (!c) return "";
  const h = c.slice(0, 2);
  const m = c.slice(2, 4);
  return m ? `${h}:${m}` : h;
};

/* =========================
   calculate (minutes 기반)
========================= */

// 시작~종료 차이 (분) - 자정 넘어가는 경우 포함
export const diffMinutes = (s, f) => {
  const start = hmToMinutes(s);
  const end = hmToMinutes(f);
  if (start == null || end == null) return 0;
  return Math.max((end < start ? end + 1440 : end) - start, 0);
};

/* =========================
   calculate (hours / HM)
========================= */

// 점심시간(12~13) 차감 포함, 시간 단위 반환
export const calculateDurationInHours = (start, finish) => {
  const [startH, startM] = start.split(":").map(Number);
  const [finishH, finishM] = finish.split(":").map(Number);

  const startTotalMinutes = startH * 60 + startM;
  const finishTotalMinutes = finishH * 60 + finishM;

  let duration = finishTotalMinutes - startTotalMinutes;

  // 점심시간 범위
  const lunchStart = 12 * 60; // 12:00
  const lunchEnd = 13 * 60;   // 13:00

  // 점심시간이 작업 시간에 포함되면 차감
  const isLunchIncluded =
    startTotalMinutes < lunchEnd && finishTotalMinutes > lunchStart;

  if (isLunchIncluded) {
    duration -= 60;
  }

  return duration > 0 ? duration / 60 : 0;
};

// 소수 시간 → HH:mm:ss
export const convertHoursToHMS = (floatHours) => {
  const hours = Math.floor(floatHours);
  const minutes = Math.floor((floatHours - hours) * 60);
  const seconds = Math.round(((floatHours - hours) * 60 - minutes) * 60);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
};

// 5시간(300분) 이상이면 1시간 차감 → "X시간 Y분"
export const calculateDurationInHM = (start, end) => {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);

  const startDate = new Date(0, 0, 0, sh, sm);
  const endDate = new Date(0, 0, 0, eh, em);

  let diffMs = endDate - startDate;
  if (diffMs <= 0) return "";

  const diffMinsTotal = Math.floor(diffMs / 1000 / 60);
  let diffMins = diffMinsTotal;

  // 5시간 이상이면 1시간 차감
  if (diffMinsTotal >= 300) {
    diffMins -= 60;
  }

  if (diffMins <= 0) return "";

  const hours = Math.floor(diffMins / 60);
  const minutes = diffMins % 60;

  return `${hours > 0 ? `${hours}시간` : ""} ${
    minutes > 0 ? `${minutes}분` : ""
  }`.trim();
};
