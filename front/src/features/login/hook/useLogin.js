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
  const {
    loading,
    userUuid,
    loginType,
    mustChangePassword,
    revalidate,
    setUserName,
    setLoginType,
    setMustChangePassword,
  } =
      useUser();




  const [role, setRoleState] = useState("user"); // "admin" | "user"
  const [fadeOut, setFadeOut] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberId, setRememberId] = useState(false);
  
  // ?몄뀡 ?숈븞 ??븷蹂??낅젰媛믪쓣 湲곗뼲?섍린 ?꾪븳 ?곹깭
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

  /* ================= ?먮룞 濡쒓렇??泥섎━ ================= */
  useEffect(() => {


    // 濡쒕뵫???꾨즺?섏뿀怨? ?좏슚??userUuid? loginType???덈떎硫??대? 濡쒓렇?몃맂 ?곹깭
    if (!loading && userUuid && loginType) {
    
      
      if (loginType === "admin") {
        navigate("/dashboard", { replace: true });
      } else if (loginType === "user") {
        navigate(mustChangePassword ? "/data/password-change" : "/data", { replace: true });
      }
    } 
  }, [loading, userUuid, loginType, mustChangePassword, navigate]);

  // ?꾩옱 ??븷???곕Ⅸ ?ㅽ넗由ъ? ??寃곗젙
  const storageKey = role === "admin" ? "rememberedAdminId" : "rememberedUserId";

  /* ================= ??븷 ?꾪솚 諛?珥덇린 濡쒕뱶 ================= */

  useEffect(() => {
    const savedId = localStorage.getItem(storageKey);
    if (savedId) {
      setValues((prev) => ({ ...prev, id: savedId }));
      setRememberId(true);
    } else {
      // 濡쒖뺄 ?ㅽ넗由ъ????놁쑝硫??대떦 ??븷???몄뀡 ??κ컪(?낅젰?덈뜕 媛???遺덈윭??      setValues((prev) => ({ ...prev, id: sessionIds[role] }));
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

  /* ================= role 蹂寃?================= */

  const setRole = (nextRole) => {
    if (nextRole === role) return;

    // ?꾩옱 ?낅젰??ID瑜??꾩옱 ??븷???몄뀡 ?곹깭?????    setSessionIds((prev) => ({ ...prev, [role]: values.id }));
    
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
    
    // 泥댄겕 ?댁젣 ??利됱떆 濡쒖뺄?ㅽ넗由ъ??먯꽌 ??젣 
    if (!isChecked) {
      localStorage.removeItem(storageKey);
    }
  };

  const preventSpace = (e) => {
    if (e.key === " ") e.preventDefault();
  };
  /* ================= 濡쒓렇??================= */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");

    // 1截뤴깵 validation
    const validResult = await validation({
      id: values.id,
      password: values.password,
      admin_code: values.admin_code,
      role,
      setErrors,
    });

    if (!validResult?.success) return;

    // 2截뤴깵 API ?몄텧 ??濡쒕뵫 ?쒖옉
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

            // access token check
      if (!response.access) {
        setLoginError("access token ?놁쓬");
        setIsLoading(false);
        return;
      }

      setAccessToken(response.access);

      // 4截뤴깵 ?꾩씠??湲곗뼲?섍린 泥섎━ (?깃났 ???ㅼ떆 ??踰??뺤씤)
      if (rememberId) {
        localStorage.setItem(storageKey, values.id);
      } else {
        localStorage.removeItem(storageKey);
      }

      // ?뵦 5截뤴깵 userName ?명똿
      setUserName(
        response?.user_name ??
        response?.admin_name ??
        ""
      );
      // ?뵦 5截뤴깵 userName + role ?명똿
      const userRole = response.role || role;

      setUserName(
        response?.user_name ??
        response?.admin_name ??
        ""
      );

      setLoginType(userRole);
      setMustChangePassword(userRole === "user" && response?.must_change_password === true);

      // ?뵦 6截뤴깵 ?곹깭 ?덉젙??(以묒슂)
      await revalidate();

      // ?뵦 7截뤴깵 ?대룞 (??踰덈쭔!)
      setFadeOut(true);
      //釉뚮씪?곗? 醫낅쪟 ???ъ젒???쒕룄???먮룞 ?쇱슦???덈맖
      if (userRole === "admin") {
        navigate("/dashboard");
      } else {
        navigate(response?.must_change_password === true ? "/data/password-change" : "/data");
      }



      toast({
        title: "로그인 성공",
        description: `${response?.user_name ?? response?.admin_name ?? "회원"}님 환영합니다.`,
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    } catch (err) {
      console.error("로그인 오류");
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
    loading, // ?꾩뿭 濡쒕뵫 ?곹깭 異붽? (refresh token ?뺤씤 以묒씤吏 ?щ?)
    rememberId,

    onChange,
    onRememberIdChange,
    preventSpace,
    handleSubmit,
  };
};


