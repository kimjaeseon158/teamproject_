import { useState } from "react";

import { setAccessToken } from "../../../services/api/token";
import { adminLoginAPI, userLoginAPI } from "../api/loginApi";
import { validation } from "../utils/validation";

export default function useLoginSubmit({
  navigate,
  rememberId,
  revalidate,
  role,
  setErrors,
  setLoginError,
  setLoginType,
  setMustChangePassword,
  setUserName,
  setUserWorkPlaces,
  storageKey,
  toast,
  values,
}) {
  const [fadeOut, setFadeOut] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    sessionStorage.removeItem("loggedOut");
    sessionStorage.removeItem("skipRefreshOnce");

    const validResult = await validation({
      id: values.id,
      password: values.password,
      admin_code: values.admin_code,
      role,
      setErrors,
    });

    if (!validResult?.success) return;

    setIsLoading(true);

    try {
      const response =
        role === "admin"
          ? await adminLoginAPI(values.id, values.password, values.admin_code)
          : await userLoginAPI(values.id, values.password);

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

      if (!response.access) {
        setLoginError("access token이 없습니다.");
        setIsLoading(false);
        return;
      }

      setAccessToken(response.access);

      if (rememberId) {
        localStorage.setItem(storageKey, values.id);
      } else {
        localStorage.removeItem(storageKey);
      }

      const userName = response?.user_name ?? response?.admin_name ?? "";
      const userRole = response.role || role;

      setUserName(userName);
      setLoginType(userRole);
      setUserWorkPlaces(
        userRole === "user" ? response?.work_places : []
      );
      setMustChangePassword(
        userRole === "user" && response?.must_change_password === true
      );

      await revalidate();

      setFadeOut(true);
      if (userRole === "admin") {
        navigate("/dashboard");
      } else {
        navigate(
          response?.must_change_password === true ? "/data/password-change" : "/data"
        );
      }

      toast({
        title: "로그인 성공",
        description: `${userName || "회원"}님 환영합니다.`,
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    } catch (err) {
      console.error("로그인 오류", err);
      setLoginError("서버와 연결이 원활하지 않습니다.");
      toast({
        title: "연결 오류",
        description: "서버와 연결이 지연되고 있습니다. 잠시 후 다시 시도해주세요.",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fadeOut,
    handleSubmit,
    isLoading,
  };
}
