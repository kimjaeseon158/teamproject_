import { useCallback, useState } from "react";

import { adminWorkdayBulkStatusUpdate } from "../api/adminWorkdayBulkStatusUpdate";
import { adminWorkdayStatusUpdate } from "../api/adminWorkdayStatusUpdate";

const toStatusPayload = (employee) => ({
  user_uuid: employee.user_uuid,
  work_date: employee.date,
  work_shift: employee.workShift || employee.workType,
});

export default function useApproveActions({ toast, refresh, closeDetail, clearSelection }) {
  const [detailSaving, setDetailSaving] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);

  const approveEmployee = useCallback(
    async (employee) => {
      try {
        setDetailSaving(true);
        await adminWorkdayStatusUpdate(
          {
            ...toStatusPayload(employee),
            status: true,
          },
          { toast }
        );

        toast({
          title: "승인 완료",
          status: "success",
        });

        closeDetail?.();
        refresh?.();
      } catch (err) {
        toast({
          title: "승인 중 오류 발생",
          description: err.message,
          status: "error",
        });
      } finally {
        setDetailSaving(false);
      }
    },
    [closeDetail, refresh, toast]
  );

  const rejectEmployee = useCallback(
    async (employee, rejectReason) => {
      if (!rejectReason.trim()) {
        toast({
          title: "반려 사유를 입력해주세요.",
          status: "warning",
        });
        return false;
      }

      try {
        setDetailSaving(true);
        await adminWorkdayStatusUpdate(
          {
            ...toStatusPayload(employee),
            status: false,
            reject_reason: rejectReason,
          },
          { toast }
        );

        toast({
          title: "반려 완료",
          status: "info",
        });

        closeDetail?.();
        refresh?.();
        return true;
      } catch (err) {
        toast({
          title: "반려 중 오류 발생",
          description: err.message,
          status: "error",
        });
        return false;
      } finally {
        setDetailSaving(false);
      }
    },
    [closeDetail, refresh, toast]
  );

  const updateBulkStatus = useCallback(
    async ({ rows, status, rejectReason = "", successTitle }) => {
      try {
        setBulkSaving(true);
        await adminWorkdayBulkStatusUpdate(rows, status, {
          toast,
          rejectReason,
        });

        toast({
          title: successTitle,
          description: `${rows.length}건이 처리되었습니다.`,
          status: "success",
          duration: 2500,
        });

        clearSelection?.();
        refresh?.();
        return true;
      } catch (err) {
        toast({
          title: "일괄 처리 실패",
          description: err.message,
          status: "error",
          duration: 3000,
        });
        return false;
      } finally {
        setBulkSaving(false);
      }
    },
    [clearSelection, refresh, toast]
  );

  return {
    approveEmployee,
    bulkSaving,
    detailSaving,
    rejectEmployee,
    updateBulkStatus,
  };
}
