import React, { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "./features/auth/userContext";

export default function RequireAuth({ children, role, roles }) {
  const { loading, userUuid, revalidate, loginType, mustChangePassword } =
    useUser();
  const location = useLocation();
  const allowedRoles = roles || (role ? [role] : []);

  // revalidate 중복 호출 방지
  const triedRef = useRef(false);
  const isPasswordChangePath = location.pathname === "/data/password-change";
  useEffect(() => {
    if (!loading && !userUuid && !triedRef.current) {
      triedRef.current = true;
      revalidate();
    }
  }, [loading, userUuid, revalidate]);

  // 아직 판단 불가
  if (loading) {
    return <div>세션 및 초기 데이터 불러오는 중...</div>;
  }
  // refresh까지 시도했는데도 인증 안 됨
  if (!userUuid) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  if (allowedRoles.length > 0 && !allowedRoles.includes(loginType)) {
    return <Navigate to={loginType === "admin" ? "/dashboard" : "/data"} replace />;
  }
  if (
    loginType === "user" &&
    mustChangePassword &&
    !isPasswordChangePath
  ) {
    return <Navigate to="/data/password-change" replace />;
  }
  return children;
}
