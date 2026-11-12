import { useMemo, useState } from "react";
import { useDisclosure, useToast } from "@chakra-ui/react";

import { exportWorkloadTemplate } from "../../excel/templateExcel";
import { fetchApprovedWorkDays } from "../../excel/workDayExportData";
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

  const handleExport = async (workPlace, date) => {
    try {
      setExportLoading(true);
      const workDays = await fetchApprovedWorkDays(date, workPlace, toast);
      await exportWorkloadTemplate({ workDays, month: date });

      toast({
        title: "엑셀 생성 완료",
        description: "근무 기록표가 다운로드되었습니다.",
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
