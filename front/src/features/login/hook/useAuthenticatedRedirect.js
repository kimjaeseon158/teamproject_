import { useEffect } from "react";

export default function useAuthenticatedRedirect({
  loading,
  loginType,
  mustChangePassword,
  navigate,
  userUuid,
}) {
  useEffect(() => {
    if (!loading && userUuid && loginType) {
      if (loginType === "admin") {
        navigate("/dashboard", { replace: true });
      } else if (loginType === "user") {
        navigate(mustChangePassword ? "/data/password-change" : "/data", {
          replace: true,
        });
      }
    }
  }, [loading, userUuid, loginType, mustChangePassword, navigate]);
}
