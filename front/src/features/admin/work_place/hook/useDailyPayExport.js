import { useCallback, useState } from "react";

import { exportUserPayExcel } from "../../api/google/GoogleDrive";

export default function useDailyPayExport({ onExcelExportClose, toast } = {}) {
  const [exportLoading, setExportLoading] = useState(false);

  const handleExcelExport = useCallback(async (_workPlace, date) => {
    try {
      setExportLoading(true);
      const result = await exportUserPayExcel(date);

      if (!result.success) {
        throw new Error(result.message || "엑셀 생성에 실패했습니다.");
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
        description: err.message || "잠시 후 다시 시도해주세요.",
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
