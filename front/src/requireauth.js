// src/RequireAuth.jsx
import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import UserContext from "./login/js/userContext"; // 프로젝트 구조에 맞게 경로 조정

const RequireAuth = ({ children }) => {
  const { user, loading } = useContext(UserContext);
  const location = useLocation();

  if (loading) return <div>세션 확인 중...</div>;

  // ✅ OAuth 진행 중 예외 허용 (왕복 중에는 튕기지 않도록)
  const params = new URLSearchParams(location.search);
  const oauthInFlight =
    sessionStorage.getItem("oauthInFlight") === "1" ||
    params.has("google") ||        // 예: ?google=success
    params.has("google_auth") ||   // 예: ?google_auth=success
    params.has("oauth");           // 예: ?oauth=1 (백업용)

  if (!user && !oauthInFlight) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RequireAuth;
