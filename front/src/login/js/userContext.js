import React, { createContext, useState, useEffect } from "react";

const UserContext = createContext({
  user: null,
  setUser: () => {},
  employeeNumber: null,
  setEmployeeNumber: () => {},
  userData: [],
  setUserData: () => {},
  loading: true,
});

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [employeeNumber, setEmployeeNumber] = useState(null);
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = sessionStorage.getItem("userRole");
    const savedName = sessionStorage.getItem("userName");
    const savedEmpNum = sessionStorage.getItem("employeeNumber");
    //?? 새로고침 재통신을 위한 저장
    const savedUserData = sessionStorage.getItem("userData");

    if (savedUserData) {
      try {
        const parsed = JSON.parse(savedUserData);
        if (Array.isArray(parsed)) {
          setUserData(parsed);
        } else {
          setUserData([]); // 안전하게 기본값 유지
        }
      } catch (e) {
        console.error("userData parsing error:", e);
        setUserData([]);
      }
    }

    setLoading(false);
  }, []);

  // userData가 변경될 때마다 sessionStorage에도 저장해줍니다.
  useEffect(() => {
    if (user === "admin" && Array.isArray(userData) && userData.length > 0) {
      sessionStorage.setItem("userData", JSON.stringify(userData));
    }
  }, [userData, user]);

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
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
