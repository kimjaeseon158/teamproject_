import React, { useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import UserContext from "./login/js/userContext";

export default function RequireAuth({ children }) {
  const { user, loading } = useContext(UserContext);
  const location = useLocation();
  const [prevUser, setPrevUser] = useState(null);

  // ✅ 한 번이라도 로그인했다면 백업 보관
  useEffect(() => {
    if (user) setPrevUser(user);
  }, [user]);

  // ✅ 재검증/로딩 중에는 절대 리다이렉트하지 않기
  if (loading) return <div>세션 확인 중...</div>;

  // ✅ OAuth 왕복 중 1회 예외
  const params = new URLSearchParams(location.search);
  const oauthInFlight =
    sessionStorage.getItem("oauthInFlight") === "1" ||
    params.has("google") ||
    params.has("google_auth") ||
    params.has("oauth");

  // ✅ 이전 사용자 기록이 있거나(OAuth 성공 후) 왕복 중이면 통과
  if (!user && !prevUser && !oauthInFlight) {
    return <Navigate to="/" replace />;
  }

  return children;
}
