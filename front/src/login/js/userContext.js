// src/login/js/userContext.js
import React, {
  createContext,
  useEffect,
  useState,
  useCallback,
  useContext,
} from "react";

import { fetchWithAuth } from "../../api/fetchWithAuth";
import { getAccessToken, setAccessToken, clearAccessToken } from "../../api/token";
import { useNotifySocket } from "../../ws/useNotifySocket";

const UserContext = createContext({
  user: null,
  setUser: () => {},
  loading: true,
  revalidate: async () => {},
  userData: [],
  setUserData: () => {},
  employeeNumber: null,
  setEmployeeNumber: () => {},
});

export function UserProvider({ children }) {
  // ✅ snapshot 로드 (초기 깜빡임 줄이기용)
  const loadSnapshot = () => {
    try {
      const raw = localStorage.getItem("user_snapshot");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const snapshot = loadSnapshot();

  const [user, setUser] = useState(snapshot);
  const [employeeNumber, setEmployeeNumber] = useState(
    snapshot?.employee_number ?? null
  );

  // ✅ 새로고침 부트스트랩 동안 true 유지
  const [loading, setLoading] = useState(true);

  const [userData, setUserData] = useState([]);

  // ✅ user snapshot 저장
  useEffect(() => {
    try {
      if (user) localStorage.setItem("user_snapshot", JSON.stringify(user));
      else localStorage.removeItem("user_snapshot");
    } catch {}
  }, [user]);

  /**
   * ✅ 세션 확정: check_user_login → 실패 시 check_admin_login
   * - 401/403만 진짜 로그아웃 처리
   * - 500/네트워크는 일시 실패로 보고 snapshot 유지
   */
  const revalidate = useCallback(async () => {
    try {
      let res = await fetchWithAuth("/api/check_user_login/", { method: "GET" });

      if (!res || !res.ok) {
        res = await fetchWithAuth("/api/check_admin_login/", { method: "GET" });
      }

      if (res && res.ok) {
        const data = await res.json();

        // (uuid 적용 시 여기서 data.admin_uuid / data.user_uuid 처리하면 됨)

        let nextUser = null;

        if (data?.employee_number) {
          nextUser = data; // user
          setEmployeeNumber(data.employee_number);
        } else if (data?.admin_id) {
          nextUser = data; // admin
          setEmployeeNumber(null);
        } else {
          nextUser = data ?? null;
          setEmployeeNumber(null);
        }

        setUser(nextUser);
        if (!nextUser) setEmployeeNumber(null);
        return true;
      }

      const status = res?.status;

      // ✅ 401/403만 "진짜 로그아웃"
      if (status === 401 || status === 403) {
        setUser(null);
        setEmployeeNumber(null);
        try { localStorage.removeItem("user_snapshot"); } catch {}
        return false;
      }

      // ✅ 500/네트워크 등은 일시 실패 → snapshot 유지
      console.warn("revalidate temporary failure:", status);
      return false;
    } catch (err) {
      console.error("세션 재검증 오류:", err);
      // ✅ 일시 오류면 snapshot 유지
      return false;
    }
  }, []);

  /**
   * ✅ 새로고침/첫 진입 부트스트랩
   * 1) refresh_token으로 access를 메모리에 채움 (RT는 HttpOnly 쿠키)
   * 2) revalidate로 user/admin 확정
   * 3) loading false
   */
  useEffect(() => {
    (async () => {
      setLoading(true);

      try {
        // 1) RT 쿠키로 access 재발급
        const res = await fetch("/api/refresh_token/", {
          method: "POST",
          credentials: "include",
        });

        if (res.ok) {
          const json = await res.json();
          const newAccess = json?.access || json?.access_token || json?.accessToken;

          if (newAccess) {
            setAccessToken(newAccess); // ✅ tokenStore(메모리)에 채움
          } else {
            clearAccessToken();
          }
        } else {
          clearAccessToken();
        }

        // 2) 세션 확정
        await revalidate();
      } catch (e) {
        clearAccessToken();
        setUser(null);
        setEmployeeNumber(null);
        try { localStorage.removeItem("user_snapshot"); } catch {}
      } finally {
        setLoading(false);
      }
    })();
  }, [revalidate]);

  // ✅ WS 연결: loading 끝 + user 존재 + access 존재
  const token = getAccessToken();

  useNotifySocket({
    token: !loading && user && token ? token : null,
  });

  const value = {
    user,
    setUser,
    loading,
    revalidate,
    userData,
    setUserData,
    employeeNumber,
    setEmployeeNumber,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}

export default UserContext;
