import { useState } from "react";
import { Panel_PostData } from "../api/adminPanelPost";

export function useAdminPanelLogic(initLocations, onClose) {
  const [locations, setLocations] = useState(initLocations);
  const [showAddPanel, setShowAddPanel] = useState(false);

  const [dailyPay, setDailyPay] = useState(() => {
    const initial = {};
    initLocations.forEach((loc) => {
      initial[loc] = "";
    });
    return initial;
  });

  const handleDailyPayChange = (location, value) => {
    setDailyPay((prev) => ({
      ...prev,
      [location]: value,
    }));
  };

  const handleDeleteLocation = (target) => {
    setLocations((prev) => prev.filter((loc) => loc !== target));
    setDailyPay((prev) => {
      const copy = { ...prev };
      delete copy[target];
      return copy;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const payload = {
      data_type: "user_login_info",
      data: dailyPay,
    };

    try {
      await Panel_PostData(payload);
      onClose();
    } catch (err) {
      alert("저장 중 오류 발생");
    }
  };

  const handleAddNewCompany = (company, pay) => {
    if (locations.includes(company)) {
      alert("이미 존재하는 회사입니다.");
      return;
    }
    setLocations((prev) => [...prev, company]);
    setDailyPay((prev) => ({ ...prev, [company]: pay }));
  };

  return {
    locations,
    dailyPay,
    showAddPanel,
    setShowAddPanel,
    handleDailyPayChange,
    handleDeleteLocation,
    handleSave,
    handleAddNewCompany,
  };
}
