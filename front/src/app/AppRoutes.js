import { Routes, Route, useLocation } from "react-router-dom";
import { UserProvider } from "../features/auth/userContext";
import { AlarmProvider } from "../features/alarm";

import LoginPage from "../pages/LoginPage/LoginPage";
import Calendar from "../pages/UserPage/CalendarPage";
import Dashboard from "../pages/dashboard";
import AdminPage from "../pages/AdminPage/EmployeeList";
import GoogleCallbackDone from "../features/admin/api/google/GoogleCallbackDone";
import RequireAuth from "../requireauth";

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
