import { useState } from "react";
import { AddUser_PostData } from "../api/adminPageAddPerson";
import { formatPhoneNumber, formatResidentNumber } from "../utils/format";

export function useAddPersonLogic(onSave, onClose, toast) {
  const [formData, setFormData] = useState({
    user_name: "",
    resident_number: "",
    phone_number: "010-",
    user_id: "",
    password: "",
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

    const {
      user_name,
      resident_number,
      phone_number,
      user_id,
      password,
      mobile_carrier,
      address,
      address_detail,
    } = formData;

    if (!user_name || !resident_number || !phone_number) {
      notify({
        title: "필수 항목 누락",
        description: "이름, 주민등록번호, 전화번호를 입력해주세요.",
        status: "warning",
      });
      return;
    }

    const payload = {
      user_name,
      user_id,
      password,
      phone_number,
      mobile_carrier,
      resident_number,
      address: address_detail ? `${address} ${address_detail}` : address,
    };

    try {
      const result = await AddUser_PostData(payload, { toast });
      if (result?.success) {
        onSave(payload);
        onClose();
        notify({
          title: "등록 완료",
          description: "직원 정보가 등록되었습니다.",
          status: "success",
        });
      } else {
        notify({
          title: "등록 실패",
          description: result?.error || result?.message || "직원 정보를 등록하지 못했습니다.",
          status: "error",
        });
      }
    } catch (err) {
      notify({
        title: "서버 오류",
        description: err.message || "직원 등록 중 오류가 발생했습니다.",
        status: "error",
      });
    }
  };

  return {
    formData,
    setFormData,
    handleChange,
    handleSubmitBase,
  };
}
