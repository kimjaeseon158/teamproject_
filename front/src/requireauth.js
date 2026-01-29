// src/RequireAuth.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "./login/js/userContext";

export default function RequireAuth({ children }) {
  const { userUuid, loading } = useUser();
  const location = useLocation();

  // ✅ OAuth 진행 중인지
  const params = new URLSearchParams(location.search);
  const oauthInFlight =
    sessionStorage.getItem("oauthInFlight") === "1" ||
    params.has("google") ||
    params.has("google_auth") ||
    params.has("oauth");

  // ✅ navigation 타입
  const navEntry =
    typeof performance !== "undefined"
      ? performance.getEntriesByType("navigation")[0]
      : null;
  const navType = navEntry?.type || "navigate";

  const isInitialEntry = location.key === "default" || location.key == null;
  const isDirectInput = isInitialEntry && navType === "navigate";
  const isAllowedInitialPath = location.pathname === "/" || oauthInFlight;

  // ⏳ 1) 부트스트랩 중
  if (loading) {
    return <div>세션 및 초기 데이터 불러오는 중...</div>;
  }

  // 🔐 2) 인증 기준 (🔥 핵심 수정)
  const isAuthed = !!userUuid;

  // 🚫 3) 직접 URL 입력 차단
  if (!isAuthed && !oauthInFlight && isDirectInput && !isAllowedInitialPath) {
    return <Navigate to="/" replace />;
  }

  // 🔐 4) 일반 인증 체크
  if (!isAuthed && !oauthInFlight) {
    return <Navigate to="/" replace />;
  }

  return children;
}
