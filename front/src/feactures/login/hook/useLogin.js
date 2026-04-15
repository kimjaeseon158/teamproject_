// src/login/hook/useLogin.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";

import { adminLoginAPI, userLoginAPI } from "../api/loginApi";
import { validation } from "../utils/validation";
import { useUser } from "../../auth/userContext";
import { setAccessToken } from "../../../services/api/token";

export const useLogin = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { loading, userUuid, loginType, revalidate, setUserName, setLoginType } =
      useUser();




  const [role, setRoleState] = useState("user"); // "admin" | "user"
  const [fadeOut, setFadeOut] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberId, setRememberId] = useState(false);
  
  // 세션 동안 역할별 입력값을 기억하기 위한 상태
  const [sessionIds, setSessionIds] = useState({ user: "", admin: "" });

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

  /* ================= 자동 로그인 처리 ================= */
  useEffect(() => {
    console.log("[useLogin] 자동 로그인 체크 중:", { loading, userUuid, loginType });

    // 로딩이 완료되었고, 유효한 userUuid와 loginType이 있다면 이미 로그인된 상태
    if (!loading && userUuid && loginType) {
      console.log("[useLogin] 자동 로그인 조건 충족, 리다이렉트 시도:", loginType);
      
      if (loginType === "admin") {
        navigate("/dashboard", { replace: true });
      } else if (loginType === "user") {
        navigate("/data", { replace: true });
      }
    } else {
      console.log("[useLogin] 자동 로그인 대기 중 또는 인증 필요");
    }
  }, [loading, userUuid, loginType, navigate]);

  // 현재 역할에 따른 스토리지 키 결정
  const storageKey = role === "admin" ? "rememberedAdminId" : "rememberedUserId";

  /* ================= 역할 전환 및 초기 로드 ================= */

  useEffect(() => {
    const savedId = localStorage.getItem(storageKey);
    if (savedId) {
      setValues((prev) => ({ ...prev, id: savedId }));
      setRememberId(true);
    } else {
      // 로컬 스토리지에 없으면 해당 역할의 세션 저장값(입력했던 값)을 불러옴
      setValues((prev) => ({ ...prev, id: sessionIds[role] }));
      setRememberId(false);
    }
  }, [role, storageKey, sessionIds]);

  const resetValues = () => {
    const savedId = localStorage.getItem(storageKey);
    setValues({
      id: savedId || "",
      password: "",
      admin_code: "",
    });
    setErrors({
      idError: "",
      passwordError: "",
      admin_codeError: "",
    });
    setLoginError("");
    setRememberId(!!savedId);
  };

  /* ================= role 변경 ================= */

  const setRole = (nextRole) => {
    if (nextRole === role) return;

    // 현재 입력된 ID를 현재 역할의 세션 상태에 저장
    setSessionIds((prev) => ({ ...prev, [role]: values.id }));
    
    setRoleState(nextRole);
    // Clear password and admin_code when switching roles.
    setValues((prev) => ({
      ...prev,
      password: "",
      admin_code: "",
    }));
    setErrors({
      idError: "",
      passwordError: "",
      admin_codeError: "",
    });
    setLoginError("");
  };

  /* ================= handlers ================= */

  const onChange = (name, value) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onRememberIdChange = (e) => {
    const isChecked = e.target.checked;
    setRememberId(isChecked);
    
    // 체크 해제 시 즉시 로컬스토리지에서 삭제 
    if (!isChecked) {
      localStorage.removeItem(storageKey);
    }
  };

  const preventSpace = (e) => {
    if (e.key === " ") e.preventDefault();
  };
  console.log(loginType)
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

      // 4️⃣ 아이디 기억하기 처리 (성공 시 다시 한 번 확인)
      if (rememberId) {
        localStorage.setItem(storageKey, values.id);
      } else {
        localStorage.removeItem(storageKey);
      }

      // 🔥 5️⃣ userName 세팅
      setUserName(
        response?.user_name ??
        response?.admin_name ??
        ""
      );
      // 🔥 5️⃣ userName + role 세팅
      const userRole = response.role || role;

      setUserName(
        response?.user_name ??
        response?.admin_name ??
        ""
      );

      setLoginType(userRole);

      // 🔥 6️⃣ 상태 안정화 (중요)
      await revalidate();

      // 🔥 7️⃣ 이동 (한 번만!)
      setFadeOut(true);
      //브라우저 종류 후 재접속 시도시 자동 라우팅 안됨
      if (userRole === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/data");
      }



      toast({
        title: "로그인 성공",
        description: `${response?.user_name ?? response?.admin_name ?? "회원"}님 환영합니다!`,
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
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
    loading, // 전역 로딩 상태 추가 (refresh token 확인 중인지 여부)
    rememberId,

    onChange,
    onRememberIdChange,
    preventSpace,
    handleSubmit,
  };
};
