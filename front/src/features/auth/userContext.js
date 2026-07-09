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
const MUST_CHANGE_PASSWORD_KEY = "mustChangePassword";
const SKIP_REFRESH_ONCE_KEY = "skipRefreshOnce";

export function UserProvider({ children, loginType: initialLoginType }) {
  const [loading, setLoading] = useState(true);


  const [loginType, setLoginType] = useState(initialLoginType);
  const [userUuid, setUserUuid] = useState(null);
  const [userName, setUserName] = useState(null);
  const [mustChangePassword, setMustChangePasswordState] = useState(
    () => sessionStorage.getItem(MUST_CHANGE_PASSWORD_KEY) === "true"
  );

  const setMustChangePassword = useCallback((value) => {
    const nextValue = !!value;
    setMustChangePasswordState(nextValue);
    if (nextValue) {
      sessionStorage.setItem(MUST_CHANGE_PASSWORD_KEY, "true");
    } else {
      sessionStorage.removeItem(MUST_CHANGE_PASSWORD_KEY);
    }
  }, []);

  const [alarms, setAlarms] = useState([]);
  const [alarmCount, setAlarmCount] = useState(0);

  /* =========================
     ?뵦 loginType 蹂寃???珥덇린??  ========================= */
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
     ?몄쬆 ?숆린??  ========================= */
  const revalidate = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/refresh-token/", {
        method: "POST",
        credentials: "include",
      });


      if (!res.ok) throw new Error("refresh ?ㅽ뙣");

      const json = await res.json();
      const access = json?.access;
      const serverRole = json?.Role || json?.role; // ?臾몄옄 Role怨??뚮Ц??role 紐⑤몢 ???
      const serverMustChangePassword = json?.must_change_password;
      if (!access) throw new Error("access token ?놁쓬");
      
      setAccessToken(access);
      if (serverRole) setLoginType(serverRole);
      if (typeof serverMustChangePassword === "boolean") {
        setMustChangePassword(serverMustChangePassword);
      }
      
      const payload = JSON.parse(atob(access.split(".")[1]));
      setUserUuid(payload?.sub ?? null);
      setUserName(payload?.user_name ?? null);

      return true;
    } catch (err) {
      console.error( err.message);
      clearAccessToken();
      setUserUuid(null);
      setUserName(null);
      setMustChangePassword(false);
      setAlarms([]);
      setAlarmCount(0);
      return false;
    } finally {
      setLoading(false);
    }
  }, [setMustChangePassword]);

  useEffect(() => {
    const token = getAccessToken();
    if (sessionStorage.getItem(SKIP_REFRESH_ONCE_KEY) === "true") {
      sessionStorage.removeItem(SKIP_REFRESH_ONCE_KEY);
      setLoading(false);
      return;
    }
    if (!token) {
      revalidate();
    } else {
      setLoading(false);
    }
  }, [revalidate]);

  const token = getAccessToken();

  /* =========================
     ?뵦 WebSocket ?곌껐
  ========================= */
  const { connected: wsConnected } = useNotifySocket({
    token: !loading && token && userUuid ? token : null,
    uuid: userUuid,
    loginType,
    onMessage: (data) => {

      /* =========================
         ?뵷 ADMIN ?꾩슜 泥섎━
      ========================= */
      if (loginType === "admin") {
        // ?뱀떆 reject ???臾댁떆
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
         ?윟 USER ?꾩슜 泥섎━
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
        loginType, // ?뵦 Alarm?먯꽌 ?ъ슜
        mustChangePassword,
        setUserName,
        setLoginType,
        setMustChangePassword,
        revalidate,
        logout: ({ skipRefresh = false } = {}) => {
          if (skipRefresh) {
            sessionStorage.setItem(SKIP_REFRESH_ONCE_KEY, "true");
          }
          clearAccessToken();
          setUserUuid(null);
          setUserName(null);
          setLoginType(null);
          setMustChangePassword(false);
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


