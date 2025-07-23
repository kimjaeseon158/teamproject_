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
    let formattedValue = value;

    if (name === "phone_number") {
      formattedValue = formatPhoneNumber(value);
    } else if (name === "resident_number") {
      formattedValue = formatResidentNumber(value);
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
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
