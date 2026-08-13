import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";

import { useUser } from "../../auth/userContext";
import useAuthenticatedRedirect from "./useAuthenticatedRedirect";
import useLoginFormState from "./useLoginFormState";
import useLoginSubmit from "./useLoginSubmit";
import { useEffect, useState } from "react";
import { clearLoginFailures, getLoginFailures, MAX_LOGIN_FAILURES } from "../utils/loginFailureStorage";

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
    setUserWorkPlaces,
    setLoginType,
    setMustChangePassword,
  } = useUser();
  const form = useLoginFormState();
  const [failureCount, setFailureCount] = useState(0);

  useEffect(() => {
    setFailureCount(form.role === "user" ? getLoginFailures(form.values.id) : 0);
  }, [form.role, form.values.id]);

  useAuthenticatedRedirect({
    loading,
    loginType,
    mustChangePassword,
    navigate,
    userUuid,
  });

  const submit = useLoginSubmit({
    navigate,
    rememberId: form.rememberId,
    revalidate,
    role: form.role,
    setErrors: form.setErrors,
    setLoginError: form.setLoginError,
    setLoginType,
    setMustChangePassword,
    setUserName,
    setUserWorkPlaces,
    storageKey: form.storageKey,
    toast,
    values: form.values,
    onFailureCountChange: setFailureCount,
    clearPassword: form.clearPassword,
  });

  const retryAfterApproval = (targetUserId = form.values.id) => {
    clearLoginFailures(targetUserId);
    setFailureCount(0);
    form.setLoginError("");
    form.clearPassword();
    if (targetUserId && targetUserId !== form.values.id) {
      form.onChange("id", targetUserId);
    }
  };

  return {
    role: form.role,
    setRole: form.setRole,
    values: form.values,
    errors: form.errors,
    loginError: form.loginError,
    fadeOut: submit.fadeOut,
    isLoading: submit.isLoading,
    loading,
    rememberId: form.rememberId,
    onChange: form.onChange,
    onRememberIdChange: form.onRememberIdChange,
    preventSpace: form.preventSpace,
    handleSubmit: submit.handleSubmit,
    clearLoginError: () => form.setLoginError(""),
    retryAfterApproval,
    failureCount,
    isLoginLocked: form.role === "user" && failureCount >= MAX_LOGIN_FAILURES,
  };
};
