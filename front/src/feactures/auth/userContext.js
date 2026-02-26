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

  const [userUuid, setUserUuid] = useState(null);
  const [userName, setUserName] = useState(null);

  const [alarms, setAlarms] = useState([]);
  const [alarmCount, setAlarmCount] = useState(0);

  /* =========================
     🔥 loginType 변경 시 초기화
  ========================= */
  useEffect(() => {
    setAlarms([]);
    setAlarmCount(0);
  }, [loginType]);

  /* =========================
     인증 동기화
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

      const payload = JSON.parse(atob(access.split(".")[1]));
      setUserUuid(payload?.sub ?? null);
      setUserName(payload?.user_name ?? null);

      return true;
    } catch (err) {
      console.error("revalidate 실패:", err);
      clearAccessToken();
      setUserUuid(null);
      setUserName(null);
      setAlarms([]);
      setAlarmCount(0);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

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

      /* =========================
         🔵 ADMIN 전용 처리
      ========================= */
      if (loginType === "admin") {
        // 혹시 reject 와도 무시
        if (data?.rejects) {
        }

        if (typeof data?.count === "number") {
          setAlarmCount(data.count);
        }

        if (Array.isArray(data?.alarms)) {
          setAlarms(data.alarms);
        }

        return;
      }

      /* =========================
         🟢 USER 전용 처리
      ========================= */
      if (loginType === "user") {
        if (Array.isArray(data?.rejects)) {


          const mappedRejects = data.rejects.map((item, index) => ({
            id: `reject-${index}`,
            title: `${item.work_date} 근무 반려`,
            description: item.reject_reason,
            date: item.work_date,
            time: "",
            read: false,
          }));

          setAlarms(mappedRejects);
        }

        if (typeof data?.count === "number") {
          setAlarmCount(data.count);
        }

        return;
      }
    },
  });

  return (
    <UserContext.Provider
      value={{
        loading,
        userUuid,
        userName,
        alarms,
        alarmCount,
        wsConnected,
        loginType, // 🔥 Alarm에서 사용
        setUserName,
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