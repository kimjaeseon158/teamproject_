import { Routes, Route, useLocation } from "react-router-dom";
import { UserProvider } from "./login/js/userContext";
import { AlarmProvider } from "./aralm";

import LoginPage from "./login/Pages/LoginPage";
import Calendar from "./user_Calendar/page/CalendarPage";
import Dashboard from "./dashboard/dashboard";
import AdminPage from "./adminpage/page/page";
import GoogleCallbackDone from "./dashboard/api/google/GoogleCallbackDone";
import RequireAuth from "./requireauth";

export default function AppRoutes() {
  const { pathname } = useLocation();

  const loginType = pathname.startsWith("/dashboard")
    ? "admin"
    : pathname.startsWith("/data")
    ? "user"
    : null;

  return (
    <UserProvider loginType={loginType}>
      <AlarmProvider>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/oauth/callback" element={<GoogleCallbackDone />} />

          <Route
            path="/data"
            element={
              <RequireAuth>
                <Calendar />
              </RequireAuth>
            }
          />

          <Route
            path="/dashboard/*"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />

          <Route
            path="/admin-info"
            element={
              <RequireAuth>
                <useAdminInformationLogic />
              </RequireAuth>
            }
          />

          <Route
            path="/adminpage/*"
            element={
              <RequireAuth>
                <AdminPage />
              </RequireAuth>
            }
          />
        </Routes>
      </AlarmProvider>
    </UserProvider>
  );
}
