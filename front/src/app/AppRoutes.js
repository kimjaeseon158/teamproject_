import { Navigate, Routes, Route, useLocation } from "react-router-dom";
import { UserProvider } from "../features/auth/userContext";
import { AlarmProvider } from "../features/alarm";

import LoginPage from "../pages/LoginPage/LoginPage";
import Calendar from "../pages/UserPage/CalendarPage";
import PasswordChangePage from "../pages/UserPage/PasswordChangePage";
import BoardNoticePage from "../pages/UserPage/BoardNoticePage";
import BoardContactsPage from "../pages/UserPage/BoardContactsPage";
import BoardWorkSchedulePage from "../pages/UserPage/BoardWorkSchedulePage";
import Dashboard from "../pages/dashboard";
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
            path="/note"
            element={
              <RequireAuth roles={["admin", "user"]}>
                <BoardNoticePage />
              </RequireAuth>
            }
          />
          <Route
            path="/note/contacts"
            element={
              <RequireAuth roles={["admin", "user"]}>
                <BoardContactsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/note/work-schedule"
            element={
              <RequireAuth roles={["admin", "user"]}>
                <BoardWorkSchedulePage />
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
