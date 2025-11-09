import { useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import UserContext from "../../login/js/userContext"; // ← 대소문자/경로 주의!

export default function GoogleCallbackDone() {
  const { revalidate } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    (async () => {
      // 서버 콜백에서 HttpOnly 쿠키(액세스/리프레시) 설정했다는 가정
      await revalidate();

      // 콜백 1회성 플래그 해제
      sessionStorage.removeItem("oauthInFlight");

      // 목적지 있으면 그쪽으로, 없으면 대시보드로
      const params = new URLSearchParams(location.search);
      const to = params.get("to") || "/dashboard";
      navigate(to, { replace: true });
    })();
  }, [revalidate, navigate, location.search]);

  return <div>로그인 완료 처리 중...</div>;
}
