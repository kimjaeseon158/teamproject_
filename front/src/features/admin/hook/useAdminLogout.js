import { useNavigate } from "react-router-dom";

import { useUser } from "../../auth/userContext";
import { logoutAdmin } from "../api/adminLogoutApi";

export default function useAdminLogout() {
  const navigate = useNavigate();
  const { userUuid, logout } = useUser();

  const handleLogout = async () => {
    try {
      await logoutAdmin(userUuid);
    } catch (err) {
      console.error("logout error", err);
    } finally {
      logout({ skipRefresh: true });
      navigate("/", { replace: true });
    }
  };

  return {
    canLogout: Boolean(userUuid),
    handleLogout,
  };
}
