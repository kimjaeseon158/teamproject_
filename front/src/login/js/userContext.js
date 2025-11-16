import React, {
  createContext,
  useEffect,
  useState,
  useCallback,
  useContext,
} from "react";
import { fetchWithAuth } from "../../api/fetchWithAuth";

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
  // 스냅샷 로드 함수
  const loadSnapshot = () => {
    try {
      const raw = localStorage.getItem("user_snapshot");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const [user, setUser] = useState(loadSnapshot);
  const [loading, setLoading] = useState(false);   // ← 처음부터 false
  const [userData, setUserData] = useState([]);
  const [employeeNumber, setEmployeeNumber] = useState(null);

  // user 바뀔 때 스냅샷 저장
  useEffect(() => {
    try {
      if (user) localStorage.setItem("user_snapshot", JSON.stringify(user));
      else localStorage.removeItem("user_snapshot");
    } catch {}
  }, [user]);

  // 재검증 함수 (로그인 성공 시에만 실행)
  const revalidate = useCallback(async () => {
    setLoading(true);
    const prev = user ?? loadSnapshot();

    try {
      let res = await fetchWithAuth("/api/check_user_login/", { method: "GET" });
      if (!res || !res.ok) {
        res = await fetchWithAuth("/api/check_admin_login/", { method: "GET" });
      }

      if (res && res.ok) {
        const data = await res.json();
        const nextUser = data?.user ?? data ?? null;
        if (nextUser) setUser(nextUser);
      } else {
        if (!prev) setUser(null);
      }
    } catch {
      if (!prev) setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

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
