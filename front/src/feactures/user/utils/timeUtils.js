/* =========================
   format / convert
========================= */

// 분 → HH:mm
export const minutesToHM = (mins) => {
  const m = Math.max(0, Number(mins) || 0);
  const hours = Math.floor(m / 60);
  const minutes = m % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

// HH:mm → 분 (24:00 지원)
export const hmToMinutes = (hm) => {
  if (!hm || !hm.includes(":")) return null;
  const [h, m] = hm.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
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
  
  // 만약 종료시간이 시작시간보다 작으면 다음날로 간주 (단, 24:00은 예외처리될 수 있음)
  let diff = end - start;
  if (diff < 0) diff += 1440; 
  
  return diff;
};

// 실근무 시간 계산 (휴게시간/점심시간 차감)
export const calculateNetMinutes = (s, f) => {
  const total = diffMinutes(s, f);
  // 5시간(300분) 이상 근무 시 1시간(60분) 점심/휴게 시간 차감
  if (total >= 300) {
    return total - 60;
  }
  return total;
};

/* =========================
   calculate (hours / HM)
========================= */

// 점심시간(12~13) 차감 포함, 시간 단위 반환
export const calculateDurationInHours = (start, finish) => {
  const startTotalMinutes = hmToMinutes(start);
  const finishTotalMinutes = hmToMinutes(finish);
  if (startTotalMinutes === null || finishTotalMinutes === null) return 0;

  let duration = diffMinutes(start, finish);

  // 점심시간 범위 (단순화된 계산)
  const lunchStart = 12 * 60; // 12:00
  const lunchEnd = 13 * 60;   // 13:00

  // 시작~종료 사이에 12:00~13:00이 포함되는지 확인 (매우 단순화된 로직)
  // 실제로는 더 복잡한 교집합 계산이 필요할 수 있음
  if (startTotalMinutes < lunchEnd && (startTotalMinutes + duration) > lunchStart) {
    duration -= 60;
  }

  return Math.max(0, duration / 60);
};

// 소수 시간 → HH:mm:ss
export const convertHoursToHMS = (floatHours) => {
  const m = Math.round(floatHours * 60);
  const hours = Math.floor(m / 60);
  const minutes = m % 60;
  const seconds = 0; // 초는 무시

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:00`;
};

// "X시간 Y분" 포맷
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
