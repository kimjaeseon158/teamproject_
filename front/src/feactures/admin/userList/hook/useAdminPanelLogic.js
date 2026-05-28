import { useState } from "react";
import { Panel_PostData } from "../api/admnsdbPost";

export function useAdminPanelLogic(initLocations, onClose, toast) {
  const [locations, setLocations] = useState(initLocations);
  const [showAddPanel, setShowAddPanel] = useState(false);

  const [dailyPay, setDailyPay] = useState(() => {
    const initial = {};
    initLocations.forEach((location) => {
      initial[location] = "";
    });
    return initial;
  });

  const notify = (options) => {
    toast?.({
      duration: 2500,
      isClosable: true,
      ...options,
    });
  };

  const handleDailyPayChange = (location, value) => {
    setDailyPay((prev) => ({
      ...prev,
      [location]: value,
    }));
  };

  const handleDeleteLocation = (target) => {
    setLocations((prev) => prev.filter((location) => location !== target));
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
      notify({
        title: "저장 실패",
        description: err.message || "저장 중 오류가 발생했습니다.",
        status: "error",
      });
    }
  };

  const handleAddNewCompany = (company, pay) => {
    if (locations.includes(company)) {
      notify({
        title: "중복된 회사",
        description: "이미 존재하는 회사입니다.",
        status: "warning",
      });
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
