import { useState, useEffect } from "react";
import locationsList from "../../../common/work_placeCloums/locationsList";
import {
  formatPhoneNumber,
  formatResidentNumber,
} from "../utils/format";

export function useAdminInformationLogic(person, onClose, onSave) {
  const [formData, setFormData] = useState({
    ...person,
    phone_number: person?.phone_number || "010-",
  });

  const [showPanel, setShowPanel] = useState(false);

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
      setFormData((prev) => ({
        ...prev,
        phone_number: formatPhoneNumber(value),
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { user_name, resident_number, address, phone_number } = formData;

    if (!user_name || !resident_number || !address || !phone_number) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    if (!/^\d{6}-?\d{7}$/.test(resident_number)) {
      alert("주민등록번호 형식이 올바르지 않습니다.");
      return;
    }

    if (!/^01[016789]-\d{3,4}-\d{4}$/.test(phone_number)) {
      alert("전화번호 형식이 올바르지 않습니다.");
      return;
    }

    onSave(formData);
    onClose();
  };

  const handleBackFromPanel = () => {
    setShowPanel(false);
  };

  return {
    formData,
    showPanel,
    handleChange,
    handleSubmit,
    handleBackFromPanel,
    locationsList,
  };
}
