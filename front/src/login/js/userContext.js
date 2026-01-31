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
} from "../../api/token";
import { useNotifySocket } from "../../ws/useNotifySocket";

const UserContext = createContext(null);

export function UserProvider({ children, loginType }) {
  const [loading, setLoading] = useState(true);
  const [userUuid, setUserUuid] = useState(null);
  const [alarms, setAlarms] = useState([]);
  // 🔔 알림 상태
  const [alarmCount, setAlarmCount] = useState(0);

  // 인증 동기화
  const revalidate = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/refresh_token/", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) throw new Error();

      const json = await res.json();
      const access = json?.access;
      if (!access) throw new Error();

      setAccessToken(access);

      const payload = JSON.parse(atob(access.split(".")[1]));
      setUserUuid(payload?.sub ?? null);
      return true;
    } catch {
      clearAccessToken();
      setUserUuid(null);
      setAlarmCount(0);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // 최초 진입 시 (access 없을 때만)
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      revalidate();
    } else {
      setLoading(false);
    }
  }, [revalidate]);

  const token = getAccessToken();

  // 🔥 WS 연결
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
    },
  });

  return (
    <UserContext.Provider
      value={{
        loading,
        userUuid,
        alarmCount,
        alarms,
        wsConnected, // 🔥 핵심
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
