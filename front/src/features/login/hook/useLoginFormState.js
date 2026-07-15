import { useEffect, useState } from "react";

export default function useLoginFormState() {
  const [role, setRoleState] = useState("user");
  const [rememberId, setRememberId] = useState(false);
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

  const storageKey = role === "admin" ? "rememberedAdminId" : "rememberedUserId";

  useEffect(() => {
    const savedId = localStorage.getItem(storageKey);
    if (savedId) {
      setValues((prev) => ({ ...prev, id: savedId }));
      setRememberId(true);
    } else {
      setValues((prev) => ({ ...prev, id: sessionIds[role] }));
      setRememberId(false);
    }
  }, [role, storageKey, sessionIds]);

  const setRole = (nextRole) => {
    if (nextRole === role) return;

    setSessionIds((prev) => ({ ...prev, [role]: values.id }));
    setRoleState(nextRole);
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

  const onChange = (name, value) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onRememberIdChange = (e) => {
    const isChecked = e.target.checked;
    setRememberId(isChecked);

    if (!isChecked) {
      localStorage.removeItem(storageKey);
    }
  };

  const preventSpace = (e) => {
    if (e.key === " ") e.preventDefault();
  };

  return {
    errors,
    loginError,
    onChange,
    onRememberIdChange,
    preventSpace,
    rememberId,
    role,
    setErrors,
    setLoginError,
    setRole,
    storageKey,
    values,
  };
}
