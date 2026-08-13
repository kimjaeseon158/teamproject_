import { useMemo, useState } from "react";

import { minutesToHM } from "../utils/timeUtils";
import useExtraWorkRows from "./useExtraWorkRows";
import { useOptionHandlers } from "./useOptionHandlers";
import useOptionWorkTime from "./useOptionWorkTime";
import useWorkCartState from "./useWorkCartState";

export default function useOptionForm({
  existingWorks,
  isMobile,
  onClose,
  onRefresh,
  selectedDate,
  toast,
  userName,
  userUuid,
}) {
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");
  const workTimeForm = useOptionWorkTime(isMobile);
  const extraWorkRows = useExtraWorkRows({
    finishTime: workTimeForm.finishTime,
    startTime: workTimeForm.startTime,
  });
  const cartState = useWorkCartState();

  const totalWorkTimeHM = useMemo(() => {
    const totalMins = workTimeForm.baseWorkMinutes + extraWorkRows.extraWorkMinutes;
    return totalMins > 0 ? minutesToHM(totalMins) : "";
  }, [extraWorkRows.extraWorkMinutes, workTimeForm.baseWorkMinutes]);

  const resetForm = () => {
    setLocation("");
    setNote("");
    workTimeForm.resetWorkTime();
    extraWorkRows.resetExtraWorks();
  };

  const handlers = useOptionHandlers({
    existingWorks,
    selectedDate,
    userUuid,
    userName,
    cart: cartState.cart,
    setCart: cartState.setCart,
    toast,
    resetForm,
    baseShift: workTimeForm.baseShift,
    isSpecial: workTimeForm.isSpecial,
    startTime: workTimeForm.startTime,
    finishTime: workTimeForm.finishTime,
    location,
    note,
    extraEnabled: extraWorkRows.extraEnabled,
    extraWorks: extraWorkRows.extraWorks,
    setIsSubmitConfirmOpen: cartState.setIsSubmitConfirmOpen,
    isSubmitting: cartState.isSubmitting,
    setIsSubmitting: cartState.setIsSubmitting,
    onRefresh,
    onClose,
  });

  return {
    baseShift: workTimeForm.baseShift,
    cart: cartState.cart,
    extraEnabled: extraWorkRows.extraEnabled,
    extraWorks: extraWorkRows.extraWorks,
    filteredWorkTimeList: workTimeForm.filteredWorkTimeList,
    finishTime: workTimeForm.finishTime,
    handleFinishTimeChange: workTimeForm.handleFinishTimeChange,
    handleAddExtraRow: extraWorkRows.handleAddExtraRow,
    handleRemoveExtraRow: extraWorkRows.handleRemoveExtraRow,
    handleSelectWorkTime: workTimeForm.handleSelectWorkTime,
    handleShiftChange: workTimeForm.handleShiftChange,
    handleStartTimeChange: workTimeForm.handleStartTimeChange,
    applyPreviousWork: ({
      startTime,
      finishTime,
      location: nextLocation,
      includeNote,
      note: previousNote,
      includeExtraWork,
      extraWorks: previousExtraWorks,
    }) => {
      workTimeForm.handleSelectWorkTime(startTime, finishTime);
      setLocation(nextLocation);
      if (includeNote) setNote(previousNote || "");

      if (includeExtraWork) {
        extraWorkRows.applyExtraWorks(previousExtraWorks || []);
      }
    },
    isSpecial: workTimeForm.isSpecial,
    isSubmitConfirmOpen: cartState.isSubmitConfirmOpen,
    location,
    note,
    setExtraEnabled: extraWorkRows.setExtraEnabled,
    setIsSpecial: workTimeForm.setIsSpecial,
    setIsSubmitConfirmOpen: cartState.setIsSubmitConfirmOpen,
    setLocation,
    setNote,
    startTime: workTimeForm.startTime,
    totalWorkTimeHM,
    updateExtraWork: extraWorkRows.updateExtraWork,
    workTime: workTimeForm.workTime,
    ...handlers,
  };
}
