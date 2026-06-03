import React, { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "./feactures/auth/userContext";

export default function RequireAuth({ children }) {
  const { loading, userUuid, revalidate, loginType } = useUser();
  const location = useLocation();

  // 🔁 revalidate 중복 호출 방지
  const triedRef = useRef(false);
  const isAdminPath = location.pathname.startsWith("/dashboard");
  const isUserPath = location.pathname.startsWith("/data");  
  useEffect(() => {
    if (!loading && !userUuid && !triedRef.current) {
      triedRef.current = true;
      revalidate();
    }
  }, [loading, userUuid, revalidate]);

  // ⏳ 아직 판단 불가
  if (loading) {
    return <div>세션 및 초기 데이터 불러오는 중...</div>;
  }
  // 🔐 refresh까지 시도했는데도 인증 안 됨
  if (!userUuid) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  if (isAdminPath && loginType !== "admin") {
    return <Navigate to="/data" replace />;
  }
  if (isUserPath && loginType !== "user") {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
