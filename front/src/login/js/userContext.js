// src/login/js/userContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from "react";

/** 401이면 자동으로 /api/refresh_token/ 호출 후 원요청 재시도 */
async function fetchWithAuth(url, options = {}) {
  const opts = {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  };

  let res = await fetch(url, opts);
  if (res.status === 401) {
    // access 만료로 가정 → refresh 시도
    const refresh = await fetch("/api/refresh_token/", {
      method: "POST",
      credentials: "include",
    });
    if (refresh.ok) {
      // 재발급 성공 → 원 요청 재시도
      res = await fetch(url, opts);
    }
  }
  return res;
}

const UserContext = createContext({
  user: null,
  setUser: () => {},
  employeeNumber: null,
  setEmployeeNumber: () => {},
  userData: [],
  setUserData: () => {},
  loading: true,
  loginUser: async () => false,
  refetchMe: async () => {},
});

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [employeeNumber, setEmployeeNumber] = useState(null);
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);

  /** 서버 상태 동기화 */
  const refetchMe = useCallback(async () => {
    try {
      const res = await fetchWithAuth("/api/check_auth/", { method: "GET" });
      const data = await res.json();

      if (data?.is_authenticated) {
        setUser({ name: data.user?.username ?? data.user_name ?? "user", role: data.user?.role ?? "user" });
        setEmployeeNumber(data.user?.employeeNumber ?? data.employee_number ?? null);
        setUserData(data.user?.userData ?? []);
      } else {
        setUser(null);
        setEmployeeNumber(null);
        setUserData([]);
      }
    } catch (err) {
      console.error("세션 확인 실패:", err);
      setUser(null);
      setEmployeeNumber(null);
      setUserData([]);
    }
  }, []);

  // ✅ 첫 진입/새로고침: 조용히 refresh 한 번 → check_auth
  useEffect(() => {
    (async () => {
      try {
        await fetch("/api/refresh_token/", { method: "POST", credentials: "include" });
      } catch (_) {}
      await refetchMe();
      setLoading(false);
    })();
  }, [refetchMe]);

  // ✅ 로그인: 기존 /api/check_user_login/ 만 사용
  const loginUser = async (user_id, password) => {
    try {
      const response = await fetch("/api/check_user_login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, password }),
        credentials: "include", // 쿠키 세팅 수신
      });

      const data = await response.json();
      if (data?.success) {
        // 서버가 HttpOnly 쿠키 세팅했다는 가정
        await refetchMe(); // 최신 상태 동기화
        return true;
      } else {
        setUser(null);
        setEmployeeNumber(null);
        setUserData([]);
        return false;
      }
    } catch (err) {
      console.error("로그인 처리 실패:", err);
      return false;
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        employeeNumber,
        setEmployeeNumber,
        userData,
        setUserData,
        loading,
        loginUser,
        refetchMe,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
export default UserContext;
