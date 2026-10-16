import { useState, useEffect } from "react";
import { formatPhoneNumber, formatResidentNumber, validateEmployeeForm } from "../utils/format";

export function useAdminInformationLogic(person, onClose, onSave, toast) {
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    ...person,
    phone_number: person?.phone_number || "010-",
  });

  const notify = (options) => {
    toast?.({
      duration: 2500,
      isClosable: true,
      ...options,
    });
  };

  useEffect(() => {
    setFormData({
      ...person,
      phone_number: person?.phone_number || "010-",
    });
    setErrors({});
  }, [person]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });

    if (name === "resident_number") {
      setFormData((prev) => ({
        ...prev,
        resident_number: formatResidentNumber(value),
      }));
      return;
    }

    if (name === "phone_number") {
      let numeric = value.replace(/[^0-9]/g, "");
      if (!numeric.startsWith("010")) {
        numeric = "010";
      }
      setFormData((prev) => ({
        ...prev,
        phone_number: formatPhoneNumber(numeric),
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateEmployeeForm(formData);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      notify({
        title: "입력 정보를 확인해 주세요.",
        description: Object.values(validationErrors)[0],
        status: "warning",
      });
      return;
    }

    const saved = await onSave(formData);
    if (saved !== false) onClose();
  };

  return {
    formData,
    errors,
    handleChange,
    handleSubmit,
  };
}
