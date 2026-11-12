import { useMemo, useState } from "react";
import { useDisclosure, useToast } from "@chakra-ui/react";

import { exportSalaryTemplate } from "../../excel/templateExcel";
import { getSalaryExcelExportData } from "../../excel/excelExportApi";
import { ERROR_MESSAGES, getErrorMessage } from "../../../../constants/errorMessages";
import { useTotalFinance } from "./useTotalFinance";

export default function useTotalSalesPage() {
  const toast = useToast();
  const exportDisclosure = useDisclosure();
  const [exportLoading, setExportLoading] = useState(false);

  const {
    loading,
    apiMonth,
    setApiMonth,
    selectedDetailMonth,
    setSelectedDetailMonth,
    threeMonthData,
    detailData,
    totalExpense,
  } = useTotalFinance({ toast });

  const threeMonthTotal = useMemo(
    () => threeMonthData.reduce((sum, item) => sum + Number(item.total || 0), 0),
    [threeMonthData]
  );

  const selectedMonthTotal = useMemo(
    () => detailData.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [detailData]
  );

  const workerSummary = useMemo(() => {
    const total = selectedMonthTotal || 1;

    return [...detailData]
      .sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))
      .map((item, index) => ({
        name: item.name,
        amount: Number(item.amount || 0),
        percent: Math.round((Number(item.amount || 0) / total) * 100),
        rank: index + 1,
      }));
  }, [detailData, selectedMonthTotal]);

  const handleExport = async (_workPlace, date) => {
    try {
      setExportLoading(true);
      const response = await getSalaryExcelExportData(date, toast);
      const salaryRows = Array.isArray(response?.data) ? response.data : [];
      await exportSalaryTemplate({ salaryRows, month: date });

      toast({
        title: "엑셀 생성 완료",
        description: "급여 지급 대장이 다운로드되었습니다.",
        status: "success",
        duration: 3000,
      });
      exportDisclosure.onClose();
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
  };

  return {
    loading,
    apiMonth,
    detailData,
    exportDisclosure,
    exportLoading,
    handleExport,
    selectedDetailMonth,
    selectedMonthTotal,
    setApiMonth,
    setSelectedDetailMonth,
    threeMonthData,
    threeMonthTotal,
    totalExpense,
    workerSummary,
  };
}
