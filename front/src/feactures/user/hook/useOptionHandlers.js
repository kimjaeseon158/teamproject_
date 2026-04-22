import submitWorkInfo from "../api/submitWorkInfo";
import { diffMinutes, calculateNetMinutes } from "../utils/timeUtils";

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

    const getExtraWorkTypeLabel = (type) => {
      const labels = {
        weekday_ot: "평일 잔업",
        holiday_special: "휴일 특근",
        holiday_ot: "휴일 잔업",
        night_shift: "철야",
        night_ot: "철야 잔업",
        early_arrival: "조기 출근",
        lunch_ext: "중식 연장",
      };
      return labels[type] || "기타";
    };

    const details = [
      {
        work_type: baseShift,
        minutes: calculateNetMinutes(startTime, finishTime),
        is_overtime_approved: isSpecial,
      },
      ...extraRows.map((r) => ({
        work_type: getExtraWorkTypeLabel(r.type),
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

  const handleDeleteFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    toast({ title: "삭제되었습니다.", status: "info", duration: 1200 });
  };

  return {
    handleAddToCart,
    handleDeleteFromCart,
    handleSubmitAll,
    handleConfirmSubmitAll,
  };
}
