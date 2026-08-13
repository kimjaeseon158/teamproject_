import { useNavigate } from "react-router-dom";

import { useUser } from "../../auth/userContext";
import { logoutAdmin } from "../api/adminLogoutApi";
import { logoutGoogle } from "../api/google/googleLogoutApi";
import { clearGoogleLinked } from "../api/google/googleLinkStorage";

export default function useAdminLogout() {
  const navigate = useNavigate();
  const { userUuid, logout } = useUser();

  const handleLogout = async () => {
    try {
      await logoutGoogle();
    } catch (err) {
      console.error("google logout error", err);
    }

    try {
      await logoutAdmin(userUuid);
    } catch (err) {
      console.error("admin logout error", err);
    }

    clearGoogleLinked();
    logout({ skipRefresh: true });
    navigate("/", { replace: true });
  };

  return {
    canLogout: Boolean(userUuid),
    handleLogout,
  };
}
