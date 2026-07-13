import { useState } from "react";

import { exportApprovalSalaryExcel } from "../../api/google/GoogleDrive";

export default function useApprovalExport({ onExcelExportClose, toast } = {}) {
  const [exportLoading, setExportLoading] = useState(false);

  const handleExcelExport = async (_workPlace, date) => {
    try {
      setExportLoading(true);
      const result = await exportApprovalSalaryExcel(date);

      if (!result.success) {
        throw new Error(result.message || "문서 생성에 실패했습니다.");
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
        description: err.message || "잠시 후 다시 시도해주세요.",
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
