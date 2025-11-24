// src/login/js/userContext.js
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
  loading: false,
  revalidate: async () => {},
  userData: [],
  setUserData: () => {},
  employeeNumber: null,
  setEmployeeNumber: () => {},
});

export function UserProvider({ children }) {
  // ✅ 스냅샷 로드 함수 (localStorage → 초기값)
  const loadSnapshot = () => {
    try {
      const raw = localStorage.getItem("user_snapshot");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  // ✅ 처음엔 localStorage 스냅샷으로 user 세팅 (없으면 null)
  const [user, setUser] = useState(() => loadSnapshot());
  const [loading, setLoading] = useState(false); // 처음부터 false
  const [userData, setUserData] = useState([]);
  const [employeeNumber, setEmployeeNumber] = useState(null);

  // ✅ user 바뀔 때 스냅샷 저장/삭제
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem("user_snapshot", JSON.stringify(user));
      } else {
        localStorage.removeItem("user_snapshot");
      }
    } catch {
      // localStorage 오류는 조용히 무시
    }
  }, [user]);

  /**
   * 🔁 세션/로그인 상태 재검증
   * - "로그인 성공 시에만" 호출한다고 가정
   * - 자동 실행 없음 (useEffect 안 돌림)
   */
  const revalidate = useCallback(async () => {
    setLoading(true);

    try {
      // 1) 일반 유저 로그인 확인
      let res = await fetchWithAuth("/api/check_user_login/", {
        method: "GET", // ⬅️ 너 백엔드에 맞춰서 GET/POST 유지
      });

      // 2) 안 되면 관리자 로그인 확인
      if (!res || !res.ok) {
        res = await fetchWithAuth("/api/check_admin_login/", {
          method: "GET",
        });
      }

      if (res && res.ok) {
        const data = await res.json();
        const nextUser = data?.user ?? data ?? null;

        if (nextUser) {
          setUser(nextUser);

          // 필요하면 employeeNumber도 여기서 세팅
          if (nextUser.employee_number) {
            setEmployeeNumber(nextUser.employee_number);
          }
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
