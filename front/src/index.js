import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Login from './login/login-Front/login';
import Calendar from './calenderTest/calenderFront/calender';
import AdminPage from './adminpage/adminpage-Front/adminPage';
import Dashboard from "./dashboard/dashboard"; 
import AdminInformation from './adminpage/adminpage-Front/adminInformation';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route } from "react-router-dom";

// UserProvider import
import { UserProvider } from "./login/js/userContext";

// ChakraProvider import
import { ChakraProvider } from "@chakra-ui/react";

// 인증 체크 컴포넌트
import RequireAuth from "./requireauth";

const Root = () => {
  return (
    <ChakraProvider>    {/* 여기에 ChakraProvider 추가 */}
      <UserProvider>
        <BrowserRouter basename="/">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
              path="/data"
              element={
                <RequireAuth>
                  <Calendar />
                </RequireAuth>
              }
            />
            {/* 대시보드 라우트 (기존 /adminpage 대신) */}
            <Route
              path="/dashboard/*"
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              }
              />
            <Route path="/admin-info" element={<AdminInformation />} />
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </ChakraProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Root />);

reportWebVitals();
