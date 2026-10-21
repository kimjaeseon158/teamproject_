import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";

import { useUser } from "../../auth/userContext";
import useAuthenticatedRedirect from "./useAuthenticatedRedirect";
import useLoginFormState from "./useLoginFormState";
import useLoginSubmit from "./useLoginSubmit";
import { useCallback, useEffect, useState } from "react";

const LOGIN_LOCK_SECONDS = {
  5: 30,
  10: 60,
  15: 300,
  20: 600,
};

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
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [requiresPasswordReset, setRequiresPasswordReset] = useState(false);
  const [finalLockActive, setFinalLockActive] = useState(false);

  useEffect(() => {
    setFailureCount(0);
    setRemainingSeconds(0);
    setRequiresPasswordReset(false);
    setFinalLockActive(false);
  }, [form.role, form.values.id]);

  useEffect(() => {
    if (remainingSeconds <= 0) {
      if (finalLockActive) {
        setRequiresPasswordReset(true);
        setFinalLockActive(false);
      }
      return;
    }

    const timer = setTimeout(() => {
      setRemainingSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [finalLockActive, remainingSeconds]);

  const handleFailureCountChange = useCallback((count) => {
    const serverCount = Math.max(0, Math.min(Number(count) || 0, 20));
    setFailureCount(serverCount);

    if (serverCount === 0) {
      setRemainingSeconds(0);
      setRequiresPasswordReset(false);
      setFinalLockActive(false);
      return;
    }

    const lockSeconds = LOGIN_LOCK_SECONDS[serverCount];
    if (!lockSeconds) return;

    setRemainingSeconds(lockSeconds);
    setRequiresPasswordReset(false);
    setFinalLockActive(serverCount === 20);
  }, []);

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
    onFailureCountChange: handleFailureCountChange,
    clearPassword: form.clearPassword,
  });

  const retryAfterApproval = (targetUserId = form.values.id) => {
    setFailureCount(0);
    setRemainingSeconds(0);
    setRequiresPasswordReset(false);
    setFinalLockActive(false);
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
    remainingSeconds,
    requiresPasswordReset,
    isLoginLocked:
      form.role === "user" &&
      (remainingSeconds > 0 || requiresPasswordReset),
  };
};
