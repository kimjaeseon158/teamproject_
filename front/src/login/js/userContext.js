// src/login/js/userContext.js
import React, { createContext, useState, useEffect, useContext } from "react";

const UserContext = createContext({
  user: null,
  setUser: () => {},
  employeeNumber: null,
  setEmployeeNumber: () => {},
  userData: [],
  setUserData: () => {},
  loading: true,
  loginUser: async () => false, // 로그인 함수(유저)
});

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [employeeNumber, setEmployeeNumber] = useState(null);
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ 1) 앱 첫 진입/새로고침: 세션 확인(쿠키 기반)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/check_auth/", {
          method: "GET",
          credentials: "include", // 쿠키 동봉
        });
        const data = await res.json();

        if (data?.is_authenticated) {
          // 서버가 준 형태에 맞춰 상태 세팅
          setUser({ name: data.user.username, role: "user" });
          setEmployeeNumber(data.user.employeeNumber || null);
          setUserData(data.user.userData || []);
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
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // ✅ 2) 로그인 시도: POST /api/check_user_login/ (body 필수!)
  const loginUser = async (user_id, password) => {
    try {
      const response = await fetch("/api/check_user_login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, password }), // ← 반드시 body 포함
        credentials: "include",
      });

      const data = await response.json();
      console.log("로그인 응답:", data);

      if (data.success) {
        // 로그인 성공: 전역 상태 반영
        setUser({ name: data.user_name, role: "user" });
        setEmployeeNumber(data.employee_number || null);
        // (선택) 로그인 직후 /api/check_auth/를 한 번 더 호출해 최신 정보 동기화해도 됨
        return true;
      } else {
        setUser(null);
        setEmployeeNumber(null);
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
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
export default UserContext;
