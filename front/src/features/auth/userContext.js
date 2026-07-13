import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  getAccessToken,
  clearAccessToken,
} from "../../services/api/token";
import { refreshAuthSession } from "../../services/api/authApi";
import { useNotifySocket } from "../../services/ws/useNotifySocket";

const UserContext = createContext(null);
const MUST_CHANGE_PASSWORD_KEY = "mustChangePassword";
const SKIP_REFRESH_ONCE_KEY = "skipRefreshOnce";
const LOGGED_OUT_KEY = "loggedOut";

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
     loginType 변경 시 초기화
  ========================= */
  useEffect(() => {
    setAlarms([]);
    setAlarmCount(0);
  }, [loginType]);

  useEffect(() => {
    if (initialLoginType) {
      setLoginType(initialLoginType);
    }
  }, [initialLoginType]);

  /* =========================
     인증 동기화
  ========================= */
  const revalidate = useCallback(async () => {
    if (sessionStorage.getItem(LOGGED_OUT_KEY) === "true") {
      clearAccessToken();
      setUserUuid(null);
      setUserName(null);
      setLoginType(null);
      setMustChangePassword(false);
      setAlarms([]);
      setAlarmCount(0);
      setLoading(false);
      return false;
    }

    setLoading(true);
    try {
      const json = await refreshAuthSession();
      const access = json.access;
      const serverRole = json?.Role || json?.role;
      const serverMustChangePassword = json?.must_change_password;

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
    if (sessionStorage.getItem(LOGGED_OUT_KEY) === "true") {
      clearAccessToken();
      setUserUuid(null);
      setUserName(null);
      setLoginType(null);
      setMustChangePassword(false);
      setAlarms([]);
      setAlarmCount(0);
      setLoading(false);
      return;
    }

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
  }, [revalidate, setMustChangePassword]);

  const token = getAccessToken();

  /* =========================
     WebSocket 연결
  ========================= */
  const { connected: wsConnected } = useNotifySocket({
    token: !loading && token && userUuid ? token : null,
    uuid: userUuid,
    loginType,
    onMessage: (data) => {

      /* =========================
         ADMIN 전용 처리
      ========================= */
      if (loginType === "admin") {
        // 임시 reject 데이터 무시
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
         USER 전용 처리
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
        loginType, // Alarm에서 사용
        mustChangePassword,
        setUserName,
        setLoginType,
        setMustChangePassword,
        revalidate,
        logout: ({ skipRefresh = false } = {}) => {
          sessionStorage.setItem(LOGGED_OUT_KEY, "true");
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
