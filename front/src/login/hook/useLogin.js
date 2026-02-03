// src/login/hook/useLogin.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { adminLoginAPI, userLoginAPI } from "../api/loginApi";
import { validation } from "../utils/validation";
import { useUser } from "../js/userContext";
import { setAccessToken } from "../../api/token";

export const useLogin = () => {
  const navigate = useNavigate();
  const { revalidate, setUserName } = useUser();

  /* ================= 상태 ================= */

  const [role, setRoleState] = useState("admin"); // "admin" | "user"
  const [fadeOut, setFadeOut] = useState(false);

  const [values, setValues] = useState({
    id: "",
    password: "",
    admin_code: "",
  });

  const [errors, setErrors] = useState({
    idError: "",
    passwordError: "",
    admin_codeError: "",
  });

  const [loginError, setLoginError] = useState("");

  /* ================= reset ================= */

  const resetValues = () => {
    setValues({
      id: "",
      password: "",
      admin_code: "",
    });
    setErrors({
      idError: "",
      passwordError: "",
      admin_codeError: "",
    });
    setLoginError("");
  };

  /* ================= role 변경 ================= */

  const setRole = (nextRole) => {
    if (nextRole === role) return;
    setRoleState(nextRole);
    resetValues(); // 🔥 핵심: role 바뀌면 전부 초기화
  };

  /* ================= handlers ================= */

  const onChange = (name, value) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const preventSpace = (e) => {
    if (e.key === " ") e.preventDefault();
  };

  /* ================= 로그인 ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");

    // 1️⃣ validation
    const validResult = await validation({
      id: values.id,
      password: values.password,
      admin_code: values.admin_code,
      role,
      setErrors,
    });

    if (!validResult?.success) return;

    // 2️⃣ API 호출
    let response;

    if (role === "admin") {
      response = await adminLoginAPI(
        values.id,
        values.password,
        values.admin_code
      );
    } else {
      response = await userLoginAPI(values.id, values.password);
    }

    if (!response?.success) {
      setLoginError(response?.message || "로그인 실패");
      return;
    }

    // 3️⃣ 토큰 저장
    if (!response.access) {
      setLoginError("access token 없음");
      return;
    }

    setAccessToken(response.access);

    // 4️⃣ Context 동기화
    await revalidate();

    if (role === "user") {
      setUserName(response?.name ?? "");
    }

    // 5️⃣ 이동
    setFadeOut(true);

    if (role === "admin") {
      navigate("/dashboard");
    } else {
      navigate("/data");
    }
  };

  /* ================= return ================= */

  return {
    role,
    setRole,          // 👈 RoleTabs에서 이거만 쓰면 됨

    values,
    errors,
    loginError,
    fadeOut,

    onChange,
    preventSpace,
    handleSubmit,
  };
};
