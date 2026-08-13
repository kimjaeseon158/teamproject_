import { useState } from "react";

import { setAccessToken } from "../../../services/api/token";
import { adminLoginAPI, userLoginAPI } from "../api/loginApi";
import { validation } from "../utils/validation";
import { ERROR_MESSAGES, getErrorMessage } from "../../../constants/errorMessages";
import { clearLoginFailures, incrementLoginFailures } from "../utils/loginFailureStorage";

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
  onFailureCountChange,
  clearPassword,
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
        const message = response?.message || ERROR_MESSAGES.login.invalidCredentials;
        if (role === "user" && response?.status === 400) {
          onFailureCountChange(incrementLoginFailures(values.id));
        }
        setLoginError(message);
        clearPassword();
        setIsLoading(false);
        return;
      }

      if (!response.access) {
        setLoginError(ERROR_MESSAGES.login.sessionCreationFailed);
        setIsLoading(false);
        return;
      }

      setAccessToken(response.access);

      if (role === "user") {
        clearLoginFailures(values.id);
        onFailureCountChange(0);
      }

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
      const message = getErrorMessage(err, ERROR_MESSAGES.login.failed);
      setLoginError(message);
      clearPassword();
      toast({
        title: "연결 오류",
        description: message,
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
