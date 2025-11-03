import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import UserContext from "./login/js/userContext";

const RequireAuth = ({ children }) => {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return <div>Loading...</div>; // 로딩중 표시
  }

  // if (!user) {
  //   return <Navigate to="/" replace />;
  // }

  return children;
};

export default RequireAuth;

