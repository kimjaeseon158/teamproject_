import { useState, useEffect } from "react";
import locationsList from "../../calenderTest/js/locationsList";
import { formatPhoneNumber, formatResidentNumber  } from "../js/utils";

export function useAdminInformationLogic(person, onClose, onSave) {
  const [formData, setFormData] = useState(person);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    setFormData(person); // 모달 열릴 때 초기값 반영
  }, [person]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formatted_Value = value;

    if (name === "phone_number") {
      formatted_Value = formatPhoneNumber(value);
    } else if (name === "resident_number") {
      formatted_Value = formatResidentNumber(value);
    }

    setFormData((prev) => ({ ...prev, [name]: formatted_Value }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleShowPanel = () => {
    setShowPanel(true);
  };

  const handleBackFromPanel = () => {
    setShowPanel(false);
  };

  return {
    formData,
    showPanel,
    setShowPanel,
    handleChange,
    handleSubmit,
    handleShowPanel,
    handleBackFromPanel,
    locationsList,
  };
}
