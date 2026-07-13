import { useEffect, useState } from "react";
import { useDisclosure, useToast } from "@chakra-ui/react";

import { useApproveList } from "./useApproveList";
import useApproveActions from "./useApproveActions";
import useApprovalExport from "./useApprovalExport";
import useApprovalFilters from "./useApprovalFilters";
import useApprovalSelection from "./useApprovalSelection";
import useApprovalSummary from "./useApprovalSummary";
import useApprovalTableState from "./useApprovalTableState";
import { APPROVAL_INITIAL_STATUS } from "../constants/approvalConstants";
import { toYMD } from "../utils/approveUtils";

export default function useApprovalPage({ onExcelExportClose } = {}) {
  const toast = useToast();
  const detailDisclosure = useDisclosure();
  const { rows, loading, fetchList } = useApproveList(toast);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const filters = useApprovalFilters();
  const selection = useApprovalSelection(rows);
  const summary = useApprovalSummary(rows);
  const table = useApprovalTableState(rows);
  const approvalExport = useApprovalExport({ onExcelExportClose, toast });

  const searchWithFilters = (nextFilters = {}) => {
    const searchParams = filters.getSearchParams(nextFilters);
    if (!searchParams.range?.from) {
      toast({
        title: "날짜를 선택해주세요.",
        status: "warning",
        duration: 2000,
      });
      return;
    }

    fetchList({
      status: searchParams.status,
      workPlace: searchParams.workPlace,
      workType: searchParams.workType,
      userName: searchParams.userName,
      extraWork: searchParams.extraWork,
      startDate: toYMD(searchParams.range.from),
      endDate: toYMD(searchParams.range.to ?? searchParams.range.from),
    });
  };

  const handleSearch = () => {
    table.setCurrentPage(1);
    selection.clearSelection();
    searchWithFilters();
  };

  const actions = useApproveActions({
    toast,
    refresh: handleSearch,
    closeDetail: detailDisclosure.onClose,
    clearSelection: selection.clearSelection,
  });

  useEffect(() => {
    searchWithFilters({
      nextStatus: APPROVAL_INITIAL_STATUS,
      nextWorkPlace: "",
      nextWorkType: "",
      nextUserName: "",
      nextExtraWork: "",
      nextRange: filters.initialRange,
    });
    // initial load only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (page) => {
    selection.clearSelection();
    table.setCurrentPage(page);
  };

  const handleResetFilters = () => {
    filters.resetFilters();
    table.resetSort();
    table.setCurrentPage(1);
    selection.clearSelection();
  };

  const openDetail = (employee) => {
    setSelectedEmployee(employee);
    detailDisclosure.onOpen();
  };

  return {
    approveEmployee: actions.approveEmployee,
    bulkSaving: actions.bulkSaving,
    clearSelection: selection.clearSelection,
    currentPage: table.currentPage,
    detailDisclosure,
    detailSaving: actions.detailSaving,
    exportLoading: approvalExport.exportLoading,
    extraWork: filters.extraWork,
    handleExcelExport: approvalExport.handleExcelExport,
    handleMonthChange: filters.handleMonthChange,
    handlePageChange,
    handleRangeChange: filters.handleRangeChange,
    handleRangeReset: filters.handleRangeReset,
    handleResetFilters,
    handleSearch,
    handleSort: table.handleSort,
    handleTogglePage: selection.handleTogglePage,
    loading,
    openDetail,
    paginatedRows: table.paginatedRows,
    range: filters.range,
    rangeLabel: filters.rangeLabel,
    rejectEmployee: actions.rejectEmployee,
    selectedEmployee,
    selectedIds: selection.selectedIds,
    selectedMonth: filters.selectedMonth,
    selectedRows: selection.selectedRows,
    setExtraWork: filters.setExtraWork,
    setStatus: filters.setStatus,
    setUserName: filters.setUserName,
    setWorkPlace: filters.setWorkPlace,
    setWorkType: filters.setWorkType,
    sortField: table.sortField,
    sortOrder: table.sortOrder,
    sortedRows: table.sortedRows,
    status: filters.status,
    summary,
    toast,
    toggleOne: selection.toggleOne,
    totalPages: table.totalPages,
    updateBulkStatus: actions.updateBulkStatus,
    userName: filters.userName,
    workPlace: filters.workPlace,
    workType: filters.workType,
  };
}
