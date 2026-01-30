import React, {
  createContext,
  useEffect,
  useState,
  useContext,
} from "react";

import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from "../../api/token";
import { useNotifySocket } from "../../ws/useNotifySocket";

const UserContext = createContext({
  loading: true,
  userUuid: null,
  role: null,
  resetUser: () => {},
});

export function UserProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [userUuid, setUserUuid] = useState(null);
  const [role, setRole] = useState(null);

  const resetUser = () => {
    setUserUuid(null);
    setRole(null);
    setLoading(false);
  };

  // ✅ refresh → access → uuid + role 추출
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/refresh_token/", {
          method: "POST",
          credentials: "include",
        });

        if (!res.ok) {
          clearAccessToken();
          resetUser();
          return;
        }

        const json = await res.json();
        const access =
          json?.access || json?.access_token || json?.accessToken;

        if (!access) {
          clearAccessToken();
          resetUser();
          return;
        }

        setAccessToken(access);

        const payload = JSON.parse(atob(access.split(".")[1]));
        const uuid = payload?.sub ?? null;
        const roleFromToken = payload?.role ?? null;

        console.log("✅ [CTX INIT]", { uuid, roleFromToken });

        setUserUuid(uuid);
        setRole(roleFromToken);
      } catch (err) {
        console.error("❌ refresh bootstrap failed:", err);
        clearAccessToken();
        resetUser();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ✅ WS 연결 (role 기준 URL 분기)
  const token = getAccessToken();

  useNotifySocket({
    token: !loading && token && userUuid && role ? token : null,
    uuid: userUuid,
    role,
    onMessage: (data) => {
      console.log("📩 WS MESSAGE:", data);
    },
  });

  return (
    <UserContext.Provider
      value={{
        loading,
        userUuid,
        role,       // 🔥 반드시 전달
        resetUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

export default UserContext;
