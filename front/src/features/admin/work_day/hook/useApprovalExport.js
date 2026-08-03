import { useState } from "react";

import { exportApprovalSalaryExcel } from "../../api/google/GoogleDrive";
import { ERROR_MESSAGES, getErrorMessage } from "../../../../constants/errorMessages";

export default function useApprovalExport({ onExcelExportClose, toast } = {}) {
  const [exportLoading, setExportLoading] = useState(false);

  const handleExcelExport = async (_workPlace, date) => {
    try {
      setExportLoading(true);
      const result = await exportApprovalSalaryExcel(date);

      if (!result.success) {
        throw new Error(result.message || ERROR_MESSAGES.document.documentFailed);
      }

      toast({
        title: "문서 생성 완료",
        description: result.message || "승인관리 문서 파일이 Google Drive에 생성되었습니다.",
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
