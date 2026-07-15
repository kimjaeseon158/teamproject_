import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { useUser } from "../../../auth/userContext";

export default function GoogleCallbackDone() {
  const { revalidate } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
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
        const separator = to.includes("?") ? "&" : "?";

        navigate(`${to}${separator}google_auth=success`, { replace: true });
      } catch (err) {
        console.error(err);

        sessionStorage.removeItem("oauthInFlight");
        sessionStorage.removeItem("oauthDone");

        navigate("/login", { replace: true });
      }
    })();

    return () => {
      mounted = false;
    };
  }, [revalidate, navigate, location.search]);

  return <div>Google 연동 완료 처리 중...</div>;
}
