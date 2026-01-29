import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAccessToken } from "./api/token";
import { useUser } from "./login/js/userContext";

export default function RequireAuth({ children }) {
  const { loading } = useUser();
  const location = useLocation();

  // ⏳ 부트스트랩 중
  if (loading) {
    return <div>세션 및 초기 데이터 불러오는 중...</div>;
  }

  // 🔐 인증 기준 = access token 존재 여부
  const token = getAccessToken();
  const isAuthed = !!token;

  if (!isAuthed) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
}
