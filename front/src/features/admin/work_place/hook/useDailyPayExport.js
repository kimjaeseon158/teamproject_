import { useCallback, useState } from "react";

import { exportUserPayExcel } from "../../api/google/GoogleDrive";
import { ERROR_MESSAGES, getErrorMessage } from "../../../../constants/errorMessages";

export default function useDailyPayExport({ onExcelExportClose, toast } = {}) {
  const [exportLoading, setExportLoading] = useState(false);

  const handleExcelExport = useCallback(async (_workPlace, date) => {
    try {
      setExportLoading(true);
      const result = await exportUserPayExcel(date);

      if (!result.success) {
        throw new Error(result.message || ERROR_MESSAGES.document.excelFailed);
      }

      toast({
        title: "엑셀 생성 완료",
        description: result.message || "일급관리 엑셀 파일이 Google Drive에 생성되었습니다.",
        status: "success",
        duration: 3000,
      });
      onExcelExportClose?.();
    } catch (err) {
      toast({
        title: "엑셀 생성 실패",
        description: getErrorMessage(err, ERROR_MESSAGES.document.excelFailed),
        status: "error",
        duration: 3000,
      });
    } finally {
      setExportLoading(false);
    }
  }, [onExcelExportClose, toast]);

  return {
    exportLoading,
    handleExcelExport,
  };
}
