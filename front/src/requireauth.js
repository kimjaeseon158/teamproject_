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
  const navType = navEntry?.type || "navigate"; // 기본값: navigate

  // ✅ React Router 기준 첫 진입인지
  const isInitialEntry = location.key === "default" || location.key == null;

  // 👉 "주소창 직접입력 / 북마크 / 외부링크" 로 들어온 경우
  //    (SPA 내부 navigate가 아니라 브라우저가 처음 로드하는 진입)
  const isDirectInput = isInitialEntry && navType === "navigate";

  // 👉 첫 진입 시 허용할 경로: "/"(로그인 화면) + OAuth 콜백
  const isAllowedInitialPath =
    location.pathname === "/" || oauthInFlight;

  // ---------------------------
  //   1) URL 직접입력 차단
  //    - 첫 진입이고
  //    - path가 "/"가 아니고
  //    - OAuth도 아니면
  //    → 무조건 "/"로 튕김
  // ---------------------------
  if (isDirectInput && !isAllowedInitialPath) {
    return <Navigate to="/" replace />;
  }

  // ---------------------------
  // ⏳ 2) 세션 확인 중이면 로딩 표시
  // ---------------------------
  if (loading) {
    return <div>세션 및 초기 데이터 불러오는 중...</div>;
  }

  // ---------------------------
  // 🔐 3) 일반 인증 체크
  //    - 로그인 안 되어 있고 OAuth도 아님 → "/"로
  // ---------------------------
  if (!user && !oauthInFlight) {
    return <Navigate to="/" replace />;
  }

  // ---------------------------
  // ✅ 4) 여기까지 왔으면 통과
  // ---------------------------
  return children;
}
