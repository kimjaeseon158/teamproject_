import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import Login from "./login/login-Front/login";
import Calendar from "./calenderTest/calenderFront/calender";
import AdminPage from "./adminpage/adminpage-Front/adminPage";
import Dashboard from "./dashboard/dashboard";
import AdminInformation from "./adminpage/adminpage-Front/adminInformation";
import { AlarmProvider } from "./aralm";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// UserProvider
import { UserProvider } from "./login/js/userContext";

// ChakraProvider
import { ChakraProvider } from "@chakra-ui/react";

// 인증 체크 컴포넌트 (파일명: requireauth.jsx 로 저장)
import RequireAuth from "./requireauth";

// OAuth 콜백 처리 전용 페이지
import GoogleCallbackDone from "./dashboard/js/GoogleCallbackDone";

const Root = () => {
  return (
   <ChakraProvider>
    <UserProvider>
      <AlarmProvider>
        <BrowserRouter basename="/">
          <Routes>
            {/* 로그인 페이지 */}
            <Route path="/" element={<Login />} />

            {/* 구글 OAuth 콜백 완료 처리 화면 */}
            <Route path="/oauth/callback" element={<GoogleCallbackDone />} />

            {/* 캘린더(보호) */}
            <Route
              path="/data"
              element={
                <RequireAuth>
                  <Calendar />
                </RequireAuth>
              }
            />

            {/* 대시보드(보호) */}
            <Route
              path="/dashboard/*"
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              }
            />

            {/* 어드민 정보(보호) */}
            <Route
              path="/admin-info"
              element={
                <RequireAuth>
                  <AdminInformation />
                </RequireAuth>
              }
            />

            {/* 어드민 페이지 */}
            <Route
              path="/adminpage/*"
              element={
                <RequireAuth>
                  <AdminPage />
                </RequireAuth>
              }
            />
          </Routes>
        </BrowserRouter>
      </AlarmProvider>
    </UserProvider>
  </ChakraProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Root />);

reportWebVitals();
