import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDisclosure, useToast } from "@chakra-ui/react";

import { useApproveList } from "./useApproveList";
import useApproveActions from "./useApproveActions";
import useApprovalExport from "./useApprovalExport";
import useApprovalFilters from "./useApprovalFilters";
import useApprovalSelection from "./useApprovalSelection";
import useApprovalTableState from "./useApprovalTableState";
import useAdminWorkPlaceOptions from "../../../common/hooks/useAdminWorkPlaceOptions";
import { APPROVAL_INITIAL_STATUS } from "../constants/approvalConstants";
import { toYMD } from "../utils/approveUtils";

export default function useApprovalPage({ onExcelExportClose } = {}) {
  const toast = useToast();
  const detailDisclosure = useDisclosure();
  const { rows, pagination, summary, loading, fetchList } = useApproveList(toast);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchParams] = useSearchParams();
  const detailDate = searchParams.get("date");
  const detailOpened = useRef(false);
  const filters = useApprovalFilters(detailDate);
  const selection = useApprovalSelection(rows);
  const table = useApprovalTableState();
  const approvalExport = useApprovalExport({ onExcelExportClose, toast });
  const workPlaceOptions = useAdminWorkPlaceOptions(toast);

  useEffect(() => {
    if (detailOpened.current || loading || !detailDate || !rows.length) return;
    const workdayId = searchParams.get("workday");
    const matches = rows.filter((row) =>
      workdayId
        ? String(row.id) === workdayId
        : row.user_uuid === searchParams.get("user") &&
          row.date === detailDate &&
          row.workShift === searchParams.get("shift") &&
          row.location === searchParams.get("place")
    );
    // Never open an arbitrary record when the link is ambiguous.
    if (matches.length === 1) {
      detailOpened.current = true;
      setSelectedEmployee(matches[0]);
      detailDisclosure.onOpen();
    }
  }, [detailDate, detailDisclosure, loading, rows, searchParams]);

  const searchWithFilters = async (
    nextFilters = {},
    requestedPage = table.currentPage,
    requestedOrdering = table.getOrdering()
  ) => {
    const searchParams = filters.getSearchParams(nextFilters);
    if (!searchParams.range?.from) {
      toast({
        title: "날짜를 선택해주세요.",
        status: "warning",
        duration: 2000,
      });
      return;
    }

    const request = {
      status: searchParams.status,
      workPlace: searchParams.workPlace,
      workType: searchParams.workType,
      userName: searchParams.userName,
      extraWork: searchParams.extraWork,
      startDate: toYMD(searchParams.range.from),
      endDate: toYMD(searchParams.range.to ?? searchParams.range.from),
      page: requestedPage,
      ordering: requestedOrdering,
    };
    const nextPagination = await fetchList(request);

    if (
      nextPagination &&
      requestedPage > Math.max(1, Number(nextPagination.total_pages) || 1)
    ) {
      const lastPage = Math.max(1, Number(nextPagination.total_pages) || 1);
      table.setCurrentPage(lastPage);
      await fetchList({ ...request, page: lastPage });
    }
  };

  const handleSearch = () => {
    table.setCurrentPage(1);
    selection.clearSelection();
    searchWithFilters({}, 1);
  };

  const handleStatusChange = (status) => {
    filters.setStatus(status);
    table.setCurrentPage(1);
    selection.clearSelection();
    searchWithFilters({ nextStatus: status }, 1);
  };

  const refreshCurrentPage = () => {
    selection.clearSelection();
    searchWithFilters({}, table.currentPage);
  };

  const actions = useApproveActions({
    toast,
    refresh: refreshCurrentPage,
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
    }, 1, "-work_date");
    // initial load only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (page) => {
    selection.clearSelection();
    table.setCurrentPage(page);
    searchWithFilters({}, page);
  };

  const handleSort = (field) => {
    const ordering = table.handleSort(field);
    selection.clearSelection();
    searchWithFilters({}, 1, ordering);
  };

  const handleResetFilters = () => {
    filters.resetFilters();
    table.resetSort();
    table.setCurrentPage(1);
    selection.clearSelection();
    searchWithFilters({
      nextStatus: APPROVAL_INITIAL_STATUS,
      nextWorkPlace: "",
      nextWorkType: "",
      nextUserName: "",
      nextExtraWork: "",
      nextRange: filters.initialRange,
    }, 1, "-work_date");
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
    handleStatusChange,
    handleSort,
    handleTogglePage: selection.handleTogglePage,
    loading,
    openDetail,
    paginatedRows: rows,
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
    status: filters.status,
    summary,
    toast,
    toggleOne: selection.toggleOne,
    totalCount: pagination.total_count,
    totalPages: pagination.total_pages,
    pageSize: pagination.page_size,
    updateBulkStatus: actions.updateBulkStatus,
    userName: filters.userName,
    workPlace: filters.workPlace,
    workPlaces: workPlaceOptions.workPlaceNames,
    workPlacesLoading: workPlaceOptions.loading,
    workType: filters.workType,
  };
}
