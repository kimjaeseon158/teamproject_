// src/login/hook/useLogin.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";

import { adminLoginAPI, userLoginAPI } from "../api/loginApi";
import { validation } from "../utils/validation";
import { useUser } from "../../auth/userContext";
import { setAccessToken } from "../../../services/api/token";

export const useLogin = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { revalidate, setUserName } = useUser();

  /* ================= 상태 ================= */

  const [role, setRoleState] = useState("admin"); // "admin" | "user"
  const [fadeOut, setFadeOut] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    resetValues();
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

    // 2️⃣ API 호출 전 로딩 시작
    setIsLoading(true);
    let response;

    try {
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
        const message = response?.message || "아이디 또는 비밀번호를 확인해주세요.";
        setLoginError(message);
        toast({
          title: "로그인 실패",
          description: message,
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        setIsLoading(false);
        return;
      }

      // 3️⃣ 토큰 저장
      if (!response.access) {
        setLoginError("access token 없음");
        setIsLoading(false);
        return;
      }

      setAccessToken(response.access);

      // 🔥 4️⃣ userName 세팅
      setUserName(
        response?.user_name ??
        response?.admin_name ??
        ""
      );

      // 5️⃣ Context 동기화 (uuid 복구)
      await revalidate();

      toast({
        title: "로그인 성공",
        description: `${response?.user_name ?? response?.admin_name ?? "회원"}님 환영합니다!`,
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top",
      });

      // 6️⃣ 이동
      setFadeOut(true);
      if (role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/data");
      }
    } catch (err) {
      console.error("로그인 API 에러", err);
      setLoginError("서버와의 연결이 원활하지 않습니다.");
      toast({
        title: "연결 오류",
        description: "서버와의 연결이 지연되고 있습니다. 잠시 후 다시 시도해주세요.",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= return ================= */

  return {
    role,
    setRole,

    values,
    errors,
    loginError,
    fadeOut,
    isLoading,

    onChange,
    preventSpace,
    handleSubmit,
  };
};
