import React, { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "./login/js/userContext";

export default function RequireAuth({ children }) {
  const { loading, userUuid, revalidate } = useUser();
  const location = useLocation();

  // 🔁 revalidate 중복 호출 방지
  const triedRef = useRef(false);

  // ✅ 인증 안 된 상태면 refresh 1회 시도
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

  return children;
}
