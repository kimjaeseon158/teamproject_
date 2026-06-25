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

export function UserProvider({ children, loginType: initialLoginType }) {
  const [loading, setLoading] = useState(true);


  const [loginType, setLoginType] = useState(initialLoginType);
  const [userUuid, setUserUuid] = useState(null);
  const [userName, setUserName] = useState(null);

  const [alarms, setAlarms] = useState([]);
  const [alarmCount, setAlarmCount] = useState(0);

  /* =========================
     ?”¥ loginType ë³€ê²???ì´ˆê¸°??  ========================= */
  useEffect(() => {
    setAlarms([]);
    setAlarmCount(0);
  }, [loginType]);

  useEffect(() => {
    if (initialLoginType) {
      setLoginType(initialLoginType);
    }
  }, [initialLoginType])
  /* =========================
     ?¸ì¦ ?™ê¸°??  ========================= */
  const revalidate = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/refresh-token/", {
        method: "POST",
        credentials: "include",
      });


      if (!res.ok) throw new Error("refresh ?¤íŒ¨");

      const json = await res.json();
      const access = json?.access;
      const serverRole = json?.Role || json?.role; // ?€ë¬¸ìž Roleê³??Œë¬¸??role ëª¨ë‘ ?€??
      if (!access) throw new Error("access token ?†ìŒ");
      
      setAccessToken(access);
      if (serverRole) setLoginType(serverRole);
      
      const payload = JSON.parse(atob(access.split(".")[1]));
      setUserUuid(payload?.sub ?? null);
      setUserName(payload?.user_name ?? null);

      return true;
    } catch (err) {
      console.error( err.message);
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
     ?”¥ WebSocket ?°ê²°
  ========================= */
  const { connected: wsConnected } = useNotifySocket({
    token: !loading && token && userUuid ? token : null,
    uuid: userUuid,
    loginType,
    onMessage: (data) => {

      /* =========================
         ?”µ ADMIN ?„ìš© ì²˜ë¦¬
      ========================= */
      if (loginType === "admin") {
        // ?¹ì‹œ reject ?€??ë¬´ì‹œ
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
         ?Ÿ¢ USER ?„ìš© ì²˜ë¦¬
      ========================= */
      if (loginType === "user") {
        if (Array.isArray(data?.rejects)) {


          const mappedRejects = data.rejects.map((item, index) => ({
            id: `reject-${index}`,
            title: `${item.work_date} ê·¼ë¬´ ë°˜ë ¤`,
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
        loginType, // ?”¥ Alarm?ì„œ ?¬ìš©
        setUserName,
        setLoginType,
        revalidate,
        logout: () => {
          clearAccessToken();
          setUserUuid(null);
          setUserName(null);
          setLoginType(null);
          setAlarms([]);
          setAlarmCount(0);
        },
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