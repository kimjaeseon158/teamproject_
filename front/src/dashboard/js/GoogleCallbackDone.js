import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../../login/js/userContext"; // ✅ 변경 포인트

export default function GoogleCallbackDone() {
  const { revalidate } = useUser(); // ✅ context 직접 접근 ❌
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // ✅ StrictMode / 중복 실행 방지
    if (sessionStorage.getItem("oauthDone")) return;
    sessionStorage.setItem("oauthDone", "1");

    let mounted = true;

    (async () => {
      try {
        await revalidate();

        if (!mounted) return;

        sessionStorage.removeItem("oauthInFlight");

        const params = new URLSearchParams(location.search);
        const to = params.get("to") || "/dashboard";

        navigate(to, { replace: true });
      } catch (err) {
        console.error("Google OAuth revalidate 실패:", err);

        sessionStorage.removeItem("oauthInFlight");
        sessionStorage.removeItem("oauthDone");

        navigate("/login", { replace: true });
      }
    })();

    return () => {
      mounted = false;
    };
  }, [revalidate, navigate, location.search]);

  return <div>로그인 완료 처리 중...</div>;
}
