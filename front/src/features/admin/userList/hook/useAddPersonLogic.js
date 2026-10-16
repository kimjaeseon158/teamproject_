import { useRef, useState } from "react";
import { createEmployee } from "../api/adminPageAddPerson";
import { formatPhoneNumber, formatResidentNumber, getEmployeeSaveErrorMessage, validateEmployeeForm } from "../utils/format";

export function useAddPersonLogic(onSave, onClose, toast) {
  const submitting = useRef(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    user_name: "",
    resident_number: "",
    phone_number: "010-",
    user_id: "",
    mobile_carrier: "",
    address: "",
    address_detail: "",
  });

  const notify = (options) => {
    toast?.({
      duration: 2500,
      isClosable: true,
      ...options,
    });
  };

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

  const handleSubmitBase = async (e) => {
    e.preventDefault();
    if (submitting.current) return;

    const validationErrors = validateEmployeeForm(formData, { requireUserId: true });
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      notify({
        title: "입력 정보를 확인해 주세요.",
        description: Object.values(validationErrors)[0],
        status: "warning",
      });
      return;
    }

    const { user_name, resident_number, phone_number, user_id, mobile_carrier, address, address_detail } = formData;

    const payload = {
      user_name: user_name.trim(),
      user_id: user_id.trim(),
      phone_number,
      mobile_carrier,
      resident_number,
      address: address_detail ? `${address} ${address_detail}` : address,
    };

    submitting.current = true;
    setSaving(true);
    try {
      const result = await createEmployee(payload, { toast });
      if (result?.success) {
        await onSave(Array.isArray(result?.user_data) ? result.user_data : null);
        onClose();
        notify({
          title: "등록 완료",
          description: "직원 정보가 등록되었습니다.",
          status: "success",
        });
      } else {
        notify({
          title: "등록 실패",
          description: getEmployeeSaveErrorMessage(result?.error || result?.message, "직원 정보를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요."),
          status: "error",
        });
      }
    } catch (err) {
      notify({
        title: "등록 실패",
        description: getEmployeeSaveErrorMessage(err?.message, "직원 정보를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요."),
        status: "error",
      });
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };

  return {
    saving,
    errors,
    formData,
    setFormData,
    handleChange,
    handleSubmitBase,
  };
}
