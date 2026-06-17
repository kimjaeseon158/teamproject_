import submitWorkInfo from "../api/submitWorkInfo";
import { diffMinutes, calculateNetMinutes } from "../utils/timeUtils";
import { getExtraWorkSubmitLabel } from "../../common/workTypes";

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
  isSubmitting,
  setIsSubmitting,
  onRefresh,
  onClose,
}) {
  const handleAddToCart = () => {
    if (!location || !startTime || !finishTime) {
      toast({ title: "필수 항목을 입력하세요", status: "warning" });
      return;
    }

    const extraRows = extraEnabled
      ? extraWorks.filter((r) => r.type && r.start && r.finish)
      : [];

    const baseWorkType = isSpecial ? `${baseShift} 특근` : baseShift;
    const getExtraDetailWorkType = (type) =>
      type === "holiday_special"
        ? `${baseShift} 특근`
        : getExtraWorkSubmitLabel(type, "기타");

    const details = [
      {
        work_type: baseWorkType,
        minutes: calculateNetMinutes(startTime, finishTime),
        is_overtime_approved: isSpecial,
      },
      ...extraRows.map((r) => ({
        work_type: getExtraDetailWorkType(r.type),
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
        baseWorkType,
        details,
      },
    ]);

    toast({ title: "장바구니에 추가됨", status: "info", duration: 1200 });
    resetForm();
  };

  const handleSubmitAll = () => {
    if (isSubmitting) return;

    if (cart.length === 0) {
      toast({ title: "등록할 항목이 없습니다", status: "info" });
      return;
    }
    setIsSubmitConfirmOpen(true);
  };

  const handleConfirmSubmitAll = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting?.(true);

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
    } catch (e) {
      console.error("등록 실패 원인:");
      toast({
        title: "등록 실패",
        description: e?.message || "서버 응답을 확인해주세요.",
        status: "error",
      });
      setCart([]);
      setIsSubmitConfirmOpen(false);
      setIsSubmitting?.(false);
      return;
    }

    setCart([]);
    setIsSubmitConfirmOpen(false);
    toast({ title: "전체 등록 완료", status: "success" });

    if (onRefresh && selectedDate) {
      const ym = `${selectedDate.year}-${String(selectedDate.month).padStart(2, "0")}`;
      Promise.resolve(onRefresh(ym)).catch((e) => {
        console.error("등록 후 캘린더 새로고침 실패");
      });
    }

    try {
      onClose?.();
    } catch (e) {
      console.error("등록 후 닫기 처리 실패");
    }

    setIsSubmitting?.(false);
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
