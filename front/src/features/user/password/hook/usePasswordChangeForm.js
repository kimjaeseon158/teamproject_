import { useMemo, useState } from "react";
import { useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import { ApiDelete } from "../../../../services/api/requestJson";
import { useUser } from "../../../auth/userContext";
import { changeUserPassword } from "../../api/changePassword";
import {
  canSubmitPasswordChange,
  getPasswordChecks,
  hasKorean,
  INITIAL_PASSWORD,
} from "../utils/passwordValidation";

const initialVisibility = {
  initialPassword: false,
  newPassword: false,
  confirmPassword: false,
};

export default function usePasswordChangeForm() {
  const toast = useToast();
  const navigate = useNavigate();
  const { logout, userUuid } = useUser();
  const [values, setValues] = useState({
    initialPassword: INITIAL_PASSWORD,
    newPassword: "",
    confirmPassword: "",
  });
  const [visible, setVisible] = useState(initialVisibility);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  const hasKoreanInput =
    hasKorean(values.initialPassword) ||
    hasKorean(values.newPassword) ||
    hasKorean(values.confirmPassword);

  const checks = useMemo(() => getPasswordChecks(values), [values]);
  const canSubmit = canSubmitPasswordChange({ checks, hasKoreanInput, values });

  const handleChange = (name) => (event) => {
    setSubmitError("");
    setValues((prev) => ({
      ...prev,
      [name]: event.target.value,
    }));
  };

  const handleKeyEvent = (event) => {
    setIsCapsLockOn(event.getModifierState?.("CapsLock") ?? false);
  };

  const toggleVisible = (name) => {
    setVisible((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const result = await changeUserPassword(
        {
          currentPassword: values.initialPassword,
          newPassword: values.newPassword,
          newPasswordConfirm: values.confirmPassword,
        },
        { toast }
      );

      if (!result.success) {
        setSubmitError(result.message);
        toast({
          title: "비밀번호 변경 실패",
          description: result.message,
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        return;
      }

      await ApiDelete("/api/user-logout/", { user_uuid: userUuid }, { toast }).catch(() => null);
      logout({ skipRefresh: true });

      toast({
        title: "비밀번호 변경 완료",
        description: "새 비밀번호로 다시 로그인해주세요.",
        status: "success",
        duration: 2500,
        isClosable: true,
        position: "top",
      });
      navigate("/", { replace: true });
    } catch (error) {
      const message = error?.message || "비밀번호 변경 중 오류가 발생했습니다.";
      setSubmitError(message);
      toast({
        title: "비밀번호 변경 오류",
        description: message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    canSubmit,
    checks,
    handleChange,
    handleKeyEvent,
    handleSubmit,
    hasKoreanInput,
    isCapsLockOn,
    isSubmitting,
    submitError,
    toggleVisible,
    values,
    visible,
  };
}
