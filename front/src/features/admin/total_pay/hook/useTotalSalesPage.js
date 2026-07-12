import { useMemo, useState } from "react";
import { useDisclosure, useToast } from "@chakra-ui/react";

import { exportToGoogleExcel } from "../../api/google/GoogleDrive";
import { useTotalFinance } from "./useTotalFinance";

export default function useTotalSalesPage() {
  const toast = useToast();
  const exportDisclosure = useDisclosure();
  const [exportLoading, setExportLoading] = useState(false);

  const {
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
      const result = await exportToGoogleExcel(workPlace, date);

      if (!result.success) {
        throw new Error(result.message || "엑셀 생성에 실패했습니다.");
      }

      toast({
        title: "엑셀 생성 완료",
        description: result.message || "Google Drive에 파일이 생성되었습니다.",
        status: "success",
        duration: 3000,
      });
      exportDisclosure.onClose();
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
  };

  return {
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
