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
  // 스냅샷 로드
  const loadSnapshot = () => {
    try {
      const raw = localStorage.getItem("user_snapshot");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const [user, setUser] = useState(loadSnapshot);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState([]);
  const [employeeNumber, setEmployeeNumber] = useState(null);

  // 스냅샷 저장
  useEffect(() => {
    try {
      if (user) localStorage.setItem("user_snapshot", JSON.stringify(user));
      else localStorage.removeItem("user_snapshot");
    } catch {}
  }, [user]);

  // ✅ 재검증: 실패해도 기존 user 유지 (스냅샷 있으면 그대로)
  const revalidate = useCallback(async () => {
    setLoading(true);
    const prev = user ?? loadSnapshot(); // 이전 상태 백업
    try {
      // 필요 시 엔드포인트 조정
      let res = await fetchWithAuth("/api/check_user_login/", { method: "GET" });
      if (!res || !res.ok) {
        // 관리자일 수 있으니 보조 엔드포인트도 시도 (없으면 제거)
        res = await fetchWithAuth("/api/check_admin_login/", { method: "GET" });
      }

      if (res && res.ok) {
        const data = await res.json();
        const nextUser = data?.user ?? data ?? null;
        if (nextUser) setUser(nextUser);
        // nextUser 없으면 prev 유지
      } else {
        // 실패해도 prev 있으면 유지, 전혀 없을 때만 null
        if (!prev) setUser(null);
      }
    } catch {
      if (!prev) setUser(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 앱 시작 시 1회 재검증
  useEffect(() => {
    revalidate();
  }, [revalidate]);

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
