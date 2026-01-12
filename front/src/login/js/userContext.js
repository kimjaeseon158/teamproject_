// src/login/js/userContext.js
import React, {
  createContext,
  useEffect,
  useState,
  useCallback,
  useContext,
} from "react";
import { fetchWithAuth } from "../../api/fetchWithAuth";

// ✅ 추가
import { getAccessToken } from "../../api/token";
import { useNotifySocket } from "../../ws/useNotifySocket";

const UserContext = createContext({
  user: null,
  setUser: () => {},
  loading: false,
  revalidate: async () => {},
  userData: [],
  setUserData: () => {},
  employeeNumber: null,
  setEmployeeNumber: () => {},
});

export function UserProvider({ children }) {
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

  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState([]);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem("user_snapshot", JSON.stringify(user));
      } else {
        localStorage.removeItem("user_snapshot");
      }
    } catch {}
  }, [user]);

  const revalidate = useCallback(async () => {
    setLoading(true);

    try {
      let res = await fetchWithAuth("/api/check_user_login/", { method: "GET" });

      if (!res || !res.ok) {
        res = await fetchWithAuth("/api/check_admin_login/", { method: "GET" });
      }

      if (res && res.ok) {
        const data = await res.json();

        let nextUser = null;

        if (data.employee_number) {
          nextUser = data;
          setEmployeeNumber(data.employee_number);
        } else if (data.admin_id) {
          nextUser = data;
          setEmployeeNumber(null);
        } else {
          nextUser = data ?? null;
          setEmployeeNumber(null);
        }

        if (nextUser) {
          setUser(nextUser);
        } else {
          setUser(null);
          setEmployeeNumber(null);
        }
      } else {
        setUser(null);
        setEmployeeNumber(null);
      }
    } catch (err) {
      console.error("세션 재검증 오류:", err);
      setUser(null);
      setEmployeeNumber(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ 전역에서 WS 연결
  const token = getAccessToken();

  useNotifySocket({
    token: user ? token : null,
    onMessage: (msg) => {
      console.log("WS 메시지:", msg);
      // 예: msg.type === "approval_updated"면 목록 refetch 트리거 걸기
    },
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
