import { useState } from "react";
import { AddUser_PostData } from "../api/adminPageAddPerson";
import {
  formatPhoneNumber,
  formatResidentNumber,
} from "../utils/format";

export function useAddPersonLogic(onSave, onClose) {
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "resident_number") {
      const formatted = formatResidentNumber(value);
      setFormData((prev) => ({
        ...prev,
        resident_number: formatted,
      }));
      return;
    }

    if (name === "phone_number") {
      let numeric = value.replace(/[^0-9]/g, "");
      // "010"으로 시작하도록 강제 (지우려 해도 010 유지)
      if (!numeric.startsWith("010")) {
        numeric = "010";
      }
      const formatted = formatPhoneNumber(numeric);
      setFormData((prev) => ({
        ...prev,
        phone_number: formatted,
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
      alert("필수 항목을 입력하세요.");
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
      const result = await AddUser_PostData(payload);
      if (result?.success) {
        onSave(payload);
        onClose();
      } else {
        alert("등록 실패");
      }
    } catch (err) {
      alert("서버 오류");
    }
  };

  return {
    formData,
    setFormData,
    handleChange,
    handleSubmitBase,
  };
}
