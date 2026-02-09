import submitWorkInfo from "../api/submitWorkInfo";
import { diffMinutes, minutesToHM } from "../utils/timeUtils";

export function useOptionHandlers({
  selectedDate,
  userUuid,
  userName,
  cart,
  setCart,
  toast,
  resetForm,
  baseShift,
  isSpecial,
  startTime,
  finishTime,
  location,
  extraEnabled,
  extraWorks,
  setIsSubmitConfirmOpen,
}) {
  const handleAddToCart = () => {
    if (!location || !startTime || !finishTime) {
      toast({ title: "필수 항목을 입력하세요", status: "warning" });
      return;
    }

    const extraRows = extraEnabled
      ? extraWorks.filter((r) => r.type && r.start && r.finish)
      : [];

    const details = [
      {
        work_type: baseShift,
        minutes: diffMinutes(startTime, finishTime),
        is_overtime_approved: isSpecial,
      },
      ...extraRows.map((r) => ({
        work_type: r.type === "overtime" ? "잔업" : "중식",
        minutes: diffMinutes(r.start, r.finish),
        is_overtime_approved: true,
      })),
    ];

    setCart((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        work_date: { ...selectedDate },
        location,
        startTime,
        finishTime,
        baseShift,
        details,
      },
    ]);

    toast({ title: "장바구니에 추가됨", status: "info", duration: 1200 });
    resetForm();
  };

  const handleSubmitAll = () => {
    if (cart.length === 0) {
      toast({ title: "등록할 항목이 없습니다", status: "info" });
      return;
    }
    setIsSubmitConfirmOpen(true);
  };

  const handleConfirmSubmitAll = async () => {
    try {
      const payload = cart.map((item) => ({
        user_uuid: userUuid,
        user_name: userName,
        work_date: item.work_date,
        startTime: item.startTime,
        finishTime: item.finishTime,
        work_shift: item.baseShift,
        location: item.location,
        details: item.details,
      }));

      await submitWorkInfo(payload);
      setCart([]);
      setIsSubmitConfirmOpen(false);
      toast({ title: "전체 등록 완료", status: "success" });
    } catch (e) {
      toast({ title: "등록 실패", status: "error" });
    }
  };

  return {
    handleAddToCart,
    handleSubmitAll,
    handleConfirmSubmitAll,
  };
}
