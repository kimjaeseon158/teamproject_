import { Navigate, Routes, Route, useLocation } from "react-router-dom";
import { UserProvider } from "../features/auth/userContext";
import { AlarmProvider } from "../features/alarm";

import LoginPage from "../pages/LoginPage/LoginPage";
import Calendar from "../pages/UserPage/CalendarPage";
import PasswordChangePage from "../pages/UserPage/PasswordChangePage";
import Dashboard from "../pages/dashboard";
import GoogleCallbackDone from "../features/admin/api/google/GoogleCallbackDone";
import RequireAuth from "../requireauth";

export default function AppRoutes() {
  const { pathname } = useLocation();

  const loginType = pathname.startsWith("/dashboard") || pathname.startsWith("/adminpage")
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
              <RequireAuth role="user">
                <Calendar />
              </RequireAuth>
            }
          />

          <Route
            path="/data/password-change"
            element={
              <RequireAuth role="user">
                <PasswordChangePage />
              </RequireAuth>
            }
          />

          <Route
            path="/dashboard/*"
            element={
              <RequireAuth role="admin">
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/adminpage/*"
            element={
              <Navigate to="/dashboard/admin" replace />
            }
          />
        </Routes>
      </AlarmProvider>
    </UserProvider>
  );
}
