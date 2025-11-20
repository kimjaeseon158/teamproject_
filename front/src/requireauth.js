// src/RequireAuth.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "./login/js/userContext";

export default function RequireAuth({ children }) {
  const { user, loading } = useUser();
  const location = useLocation();

  //  OAuth 파라미터 유지 (절대 삭제 X)
  const params = new URLSearchParams(location.search);
  const oauthInFlight =
    sessionStorage.getItem("oauthInFlight") === "1" ||
    params.has("google") ||
    params.has("google_auth") ||
    params.has("oauth");

  //  브라우저 navigation 타입 확인 (navigate / reload / back_forward)
  const navEntry =
    typeof performance !== "undefined"
      ? performance.getEntriesByType("navigation")[0]
      : null;
  const navType = navEntry?.type || "navigate"; // 기본값: navigate

  //  React Router 기준으로 "첫 진입" 인지 확인
  const isInitialEntry = location.key === "default" || location.key == null;

  //  "주소창 직접입력 / 북마크 / 외부링크" 로 진입한 경우 (새로고침은 아님)
  const isDirectInput = isInitialEntry && navType === "navigate";

  //  처음 들어올 때 허용할 경로(초기화면 /, OAuth 진행 중)
  const isAllowedInitialPath =
    location.pathname === "/" || // 초기화면만 허용
    oauthInFlight;

  // ---------------------------
  //  주소창 직접 입력은 무조건 막기 (로그인 했어도 막음)
  //  단, /, OAuth 콜백은 허용
  // ---------------------------
  if (isDirectInput && !isAllowedInitialPath) {
    return <Navigate to="/" replace />;
  }

  // ---------------------------
  //  세션 + 초기 데이터 로딩 중이면 로딩 메시지
  // ---------------------------
  if (loading) {
    return <div>세션 및 초기 데이터 불러오는 중...</div>;
  }

  // ---------------------------
  //  로그인 안 되어 있고 OAuth도 아닌 경우 → 초기화면으로
  // ---------------------------
  if (!user && !oauthInFlight) {
    return <Navigate to="/" replace />;
  }

  // ---------------------------
  //  여기까지 왔으면 통과
  // ---------------------------
  return children;
}
