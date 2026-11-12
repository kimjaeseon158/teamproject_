import { useCallback, useState } from "react";

import { exportDailyPayRates } from "../../excel/templateExcel";
import { getUserPayExcelExportData } from "../../excel/excelExportApi";
import { ERROR_MESSAGES, getErrorMessage } from "../../../../constants/errorMessages";

export default function useDailyPayExport({ toast } = {}) {
  const [exportLoading, setExportLoading] = useState(false);

  const handleExcelExport = useCallback(async (date) => {
    try {
      setExportLoading(true);
      const response = await getUserPayExcelExportData(date, [], toast);
      const payRows = Array.isArray(response?.data) ? response.data : [];
      await exportDailyPayRates(payRows, { month: date });

      toast({
        title: "엑셀 생성 완료",
        description: "직원별 일급 기준표가 다운로드되었습니다.",
        status: "success",
        duration: 3000,
      });
      return true;
    } catch (err) {
      toast({
        title: "엑셀 생성 실패",
        description: getErrorMessage(err, ERROR_MESSAGES.document.excelFailed),
        status: "error",
        duration: 3000,
      });
      return false;
    } finally {
      setExportLoading(false);
    }
  }, [toast]);

  return {
    exportLoading,
    handleExcelExport,
  };
}
