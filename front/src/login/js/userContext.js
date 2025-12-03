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

  const snapshot = loadSnapshot();

  // ✅ 처음엔 localStorage 스냅샷으로 user 세팅 (없으면 null)
  const [user, setUser] = useState(snapshot);

  // ✅ snapshot에 employee_number가 있으면 그걸로 employeeNumber 초기값 설정
  const [employeeNumber, setEmployeeNumber] = useState(
    snapshot?.employee_number ?? null
  );

  const [loading, setLoading] = useState(false); // 처음부터 false
  const [userData, setUserData] = useState([]);
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
   * - /api/check_user_login/ → { success, user_name, employee_number, access }
   * - 필요 시 /api/check_admin_login/ 도 fallback
   */
  const revalidate = useCallback(async () => {
    setLoading(true);

    try {
      // 1) 일반 유저 로그인 확인
      let res = await fetchWithAuth("/api/check_user_login/", {
        method: "GET",
      });

      // 2) 안 되면 관리자 로그인 확인
      if (!res || !res.ok) {
        res = await fetchWithAuth("/api/check_admin_login/", {
          method: "GET",
        });
      }

      if (res && res.ok) {
        const data = await res.json();


        let nextUser = null;

        // ✅ 일반 유저: 지금 네가 보여준 형태
        if (data.employee_number) {
          // ex) { success, user_name, employee_number, access }
          nextUser = data;
          setEmployeeNumber(data.employee_number);
        }
        // ✅ (옵션) 관리자 응답 형태가 있다면 여기서 처리
        else if (data.admin_id) {
          // ex) { success, admin_id, admin_name, ... }
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

  // ✅ user/employeeNumber가 바뀔 때마다 상태 확인용 로그
  useEffect(() => {
  }, [user, employeeNumber]);

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
