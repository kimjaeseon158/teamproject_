import { useState } from "react";

import { exportSalaryTemplate } from "../../excel/templateExcel";
import { fetchApprovedWorkDays } from "../../excel/workDayExportData";
import { ERROR_MESSAGES, getErrorMessage } from "../../../../constants/errorMessages";

export default function useApprovalExport({ onExcelExportClose, toast } = {}) {
  const [exportLoading, setExportLoading] = useState(false);

  const handleExcelExport = async (workPlace, date) => {
    try {
      setExportLoading(true);
      const workDays = await fetchApprovedWorkDays(date, workPlace, toast);
      await exportSalaryTemplate({ workDays, month: date });

      toast({
        title: "문서 생성 완료",
        description: "급여대장 파일이 다운로드되었습니다.",
        status: "success",
        duration: 3000,
      });
      onExcelExportClose?.();
    } catch (err) {
      toast({
        title: "문서 생성 실패",
        description: getErrorMessage(err, ERROR_MESSAGES.document.documentFailed),
        status: "error",
        duration: 3000,
      });
    } finally {
      setExportLoading(false);
    }
  };

  return {
    exportLoading,
    handleExcelExport,
  };
}
