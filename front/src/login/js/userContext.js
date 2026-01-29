import React, {
  createContext,
  useEffect,
  useState,
  useContext,
} from "react";

import { getAccessToken, setAccessToken, clearAccessToken } from "../../api/token";
import { useNotifySocket } from "../../ws/useNotifySocket";

const UserContext = createContext({
  loading: true,
  userUuid: null,
});

export function UserProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [userUuid, setUserUuid] = useState(null);

  /**
   * ✅ 앱 최초 진입 / 새로고침 시
   * 1) refresh_token → access 재발급
   * 2) access JWT에서 uuid 추출
   */
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
          setUserUuid(null);
          return;
        }

        const json = await res.json();
        const access =
          json?.access || json?.access_token || json?.accessToken;

        if (!access) {
          clearAccessToken();
          setUserUuid(null);
          return;
        }

        // ✅ access token 메모리 저장
        setAccessToken(access);

        // ✅ JWT payload 파싱 → uuid 추출
        const payload = JSON.parse(atob(access.split(".")[1]));
        const uuid = payload?.sub ?? null;

        console.log("✅ [CTX] uuid from token:", uuid);
        setUserUuid(uuid);
      } catch (err) {
        console.error("❌ refresh bootstrap failed:", err);
        clearAccessToken();
        setUserUuid(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /**
   * ✅ WebSocket 연결 (uuid + token)
   */
  const token = getAccessToken();

  useNotifySocket({
    token: !loading && token && userUuid ? token : null,
    uuid: userUuid,
    onMessage: (data) => {
      console.log("📩 WS MESSAGE:", data);
    },
  });

  return (
    <UserContext.Provider value={{ loading, userUuid }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

export default UserContext;
