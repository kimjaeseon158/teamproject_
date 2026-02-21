import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from "../../services/api/token";
import { useNotifySocket } from "../../services/ws/useNotifySocket";

const UserContext = createContext(null);

export function UserProvider({ children, loginType }) {
  const [loading, setLoading] = useState(true);

  // 🔐 인증 기준
  const [userUuid, setUserUuid] = useState(null);

  // 👤 표시용 사용자 정보
  const [userName, setUserName] = useState(null);

  // 🔔 알림 상태
  const [alarms, setAlarms] = useState([]);
  const [alarmCount, setAlarmCount] = useState(0);

  /* =========================
     인증 동기화 (refresh)
  ========================= */
  const revalidate = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/refresh_token/", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) throw new Error("refresh 실패");

      const json = await res.json();
      const access = json?.access;
      if (!access) throw new Error("access token 없음");

      setAccessToken(access);

      // JWT payload → uuid만 복구
      const payload = JSON.parse(atob(access.split(".")[1]));
            console.log(payload)
      setUserUuid(payload?.sub ?? null);
      setUserName(payload?.user_name ?? null);

      // ❗ userName은 여기서 건드리지 않는다
      return true;
    } catch (err) {
      console.error("revalidate 실패:", err);
      clearAccessToken();
      setUserUuid(null);
      setUserName(null);
      setAlarmCount(0);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);
  /* =========================
     최초 진입 시 토큰 체크
  ========================= */
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      revalidate();
    } else {
      setLoading(false);
    }
  }, [revalidate]);

  const token = getAccessToken();

  /* =========================
     🔥 WebSocket 연결
  ========================= */
  const { connected: wsConnected } = useNotifySocket({
    token: !loading && token && userUuid ? token : null,
    uuid: userUuid,
    loginType,
    onMessage: (data) => {
      console.log("📩 WS MESSAGE:", data);

      // 서버에서 계산된 알람 카운트
      if (typeof data?.count === "number") {
        setAlarmCount(data.count);
      }

      // 알람 목록이 오면 (확장용)
      if (Array.isArray(data?.alarms)) {
        setAlarms(data.alarms);
      }
    },
  });

  return (
    <UserContext.Provider
      value={{
        // 상태
        loading,
        userUuid,
        userName,
        alarms,
        alarmCount,
        wsConnected,

        // 액션
        setUserName,   // 🔥 로그인 성공 시 사용
        revalidate,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser must be used within UserProvider");
  }
  return ctx;
}
