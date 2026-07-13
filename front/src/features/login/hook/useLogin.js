import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";

import { useUser } from "../../auth/userContext";
import useAuthenticatedRedirect from "./useAuthenticatedRedirect";
import useLoginFormState from "./useLoginFormState";
import useLoginSubmit from "./useLoginSubmit";

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
  } = useUser();
  const form = useLoginFormState();

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
    storageKey: form.storageKey,
    toast,
    values: form.values,
  });

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
  };
};
