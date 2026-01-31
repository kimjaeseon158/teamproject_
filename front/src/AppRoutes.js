import { Routes, Route, useLocation } from "react-router-dom";
import { UserProvider } from "./login/js/userContext";
import { AlarmProvider } from "./aralm";

import Login from "./login/login-Front/login";
import Calendar from "./calenderTest/calenderFront/calender";
import Dashboard from "./dashboard/dashboard";
import AdminPage from "./adminpage/adminpage-Front/adminPage";
import AdminInformation from "./adminpage/adminpage-Front/adminInformation";
import GoogleCallbackDone from "./dashboard/js/GoogleCallbackDone";
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
          <Route path="/" element={<Login />} />
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
                <AdminInformation />
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
