import { useState, useEffect } from "react";
import { formatPhoneNumber, formatResidentNumber } from "../utils/format";

export function useAdminInformationLogic(person, onClose, onSave, toast) {
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
  }, [person]);

  const handleChange = (e) => {
    const { name, value } = e.target;

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

    const { user_name, resident_number, address, phone_number } = formData;

    if (!user_name || !resident_number || !address || !phone_number) {
      notify({
        title: "필수 항목 누락",
        description: "모든 필드를 입력해주세요.",
        status: "warning",
      });
      return;
    }

    if (!/^\d{6}-?\d{7}$/.test(resident_number)) {
      notify({
        title: "입력 형식 오류",
        description: "주민등록번호 형식이 올바르지 않습니다.",
        status: "warning",
      });
      return;
    }

    if (!/^01[016789]-\d{3,4}-\d{4}$/.test(phone_number)) {
      notify({
        title: "입력 형식 오류",
        description: "전화번호 형식이 올바르지 않습니다.",
        status: "warning",
      });
      return;
    }

    const saved = await onSave(formData);
    if (saved !== false) onClose();
  };

  return {
    formData,
    handleChange,
    handleSubmit,
  };
}
