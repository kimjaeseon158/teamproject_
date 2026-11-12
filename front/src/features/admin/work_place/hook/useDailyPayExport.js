import { useCallback, useState } from "react";

import { exportDailyPayRates } from "../../excel/templateExcel";
import { ERROR_MESSAGES, getErrorMessage } from "../../../../constants/errorMessages";

export default function useDailyPayExport({ rows = [], toast } = {}) {
  const [exportLoading, setExportLoading] = useState(false);

  const handleExcelExport = useCallback(async () => {
    try {
      setExportLoading(true);
      exportDailyPayRates(rows);

      toast({
        title: "엑셀 생성 완료",
        description: "직원별 일급 기준표가 다운로드되었습니다.",
        status: "success",
        duration: 3000,
      });
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
  }, [rows, toast]);

  return {
    exportLoading,
    handleExcelExport,
  };
}
