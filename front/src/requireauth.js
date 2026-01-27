// src/RequireAuth.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "./login/js/userContext";

export default function RequireAuth({ children }) {
  const { user, loading } = useUser();
  const location = useLocation();

  // ✅ OAuth 진행 중인지 (구글 로그인 콜백 등)
  const params = new URLSearchParams(location.search);
  const oauthInFlight =
    sessionStorage.getItem("oauthInFlight") === "1" ||
    params.has("google") ||
    params.has("google_auth") ||
    params.has("oauth");

  // ✅ 브라우저 navigation 타입 (navigate / reload / back_forward)
  const navEntry =
    typeof performance !== "undefined"
      ? performance.getEntriesByType("navigation")[0]
      : null;
  const navType = navEntry?.type || "navigate";

  // ✅ React Router 기준 첫 진입인지
  const isInitialEntry = location.key === "default" || location.key == null;

  // 👉 "주소창 직접입력 / 북마크 / 외부링크" 로 들어온 경우로 추정
  const isDirectInput = isInitialEntry && navType === "navigate";

  // 👉 첫 진입 시 허용할 경로: "/"(로그인) + OAuth 콜백
  const isAllowedInitialPath = location.pathname === "/" || oauthInFlight;

  // ---------------------------
  // ⏳ 1) 세션 확인 중이면 로딩 표시 (최우선)
  // ---------------------------
  if (loading) {
    return <div>세션 및 초기 데이터 불러오는 중...</div>;
  }

  // ---------------------------
  // 🔐 2) 인증 체크 (부트스트랩 끝난 뒤)
  // ---------------------------
  const isAuthed = !!user;

  // ---------------------------
  //   3) URL 직접입력 차단
  //   ✅ 중요: "로그인 안 된 게 확정"일 때만 차단
  //   - 로그인 되어 있으면 새로고침/직접입력도 허용해야 함
  // ---------------------------
  if (!isAuthed && !oauthInFlight && isDirectInput && !isAllowedInitialPath) {
    return <Navigate to="/" replace />;
  }

  // ---------------------------
  // 🔐 4) 일반 인증 체크
  // ---------------------------
  if (!isAuthed && !oauthInFlight) {
    return <Navigate to="/" replace />;
  }

  // ✅ 통과
  return children;
}
