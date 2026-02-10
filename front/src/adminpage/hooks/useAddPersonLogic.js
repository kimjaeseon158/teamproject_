import { useState } from "react";
import { AddUser_PostData } from "../api/adminPageAddPerson";
import {
  formatPhoneNumber,
  formatResidentNumber,
} from "../utils/format";

export function useAddPersonLogic(onSave, onClose) {
  const [formData, setFormData] = useState({
    people: "",
    resident_Number: "",
    masked_Resident_Number: "",
    phone_Number: "010-",
    id: "",
    pw: "",
    carrier: "",
    address: "",
    address_Detail: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "resident_Number") {
      const formatted = formatResidentNumber(value);
      setFormData((prev) => ({
        ...prev,
        resident_Number: formatted,
        masked_Resident_Number: formatted,
      }));
      return;
    }

    if (name === "phone_Number") {
      const formatted = formatPhoneNumber(value);
      setFormData((prev) => ({
        ...prev,
        phone_Number: formatted,
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
      people,
      resident_Number,
      phone_Number,
      id,
      pw,
      carrier,
      address,
      address_Detail,
    } = formData;

    if (!people || !resident_Number || !phone_Number) {
      alert("필수 항목을 입력하세요.");
      return;
    }

    const payload = {
      user_name: people,
      user_id: id,
      password: pw,
      phone_number: phone_Number,
      mobile_carrier: carrier,
      resident_number: resident_Number,
      address: `${address} ${address_Detail}`,
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
      console.error(err);
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
