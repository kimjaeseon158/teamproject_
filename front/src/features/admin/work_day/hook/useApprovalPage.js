import { useEffect, useMemo, useState } from "react";
import { useDisclosure, useToast } from "@chakra-ui/react";

import { exportApprovalSalaryExcel } from "../../api/google/GoogleDrive";
import { useApproveList } from "./useApproveList";
import { getMonthRange, toMonthValue } from "../utils/approveDateUtils";
import { toYMD } from "../utils/approveUtils";
import {
  APPROVAL_INITIAL_STATUS,
  APPROVAL_PAGE_SIZE,
} from "../constants/approvalConstants";

const getInitialRange = () => {
  const today = new Date();
  const from = new Date(today.getFullYear(), today.getMonth(), 1);
  const to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return { from, to };
};

const isRejectedStatus = (status) => status === "거절" || status === "반려";

export default function useApprovalPage({ onExcelExportClose } = {}) {
  const toast = useToast();
  const detailDisclosure = useDisclosure();
  const { rows, loading, fetchList } = useApproveList(toast);

  const initialRange = useMemo(getInitialRange, []);
  const [exportLoading, setExportLoading] = useState(false);
  const [status, setStatus] = useState(APPROVAL_INITIAL_STATUS);
  const [workPlace, setWorkPlace] = useState("");
  const [workType, setWorkType] = useState("");
  const [userName, setUserName] = useState("");
  const [extraWork, setExtraWork] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [range, setRange] = useState(initialRange);
  const [selectedMonth, setSelectedMonth] = useState(toMonthValue(initialRange.from));

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const searchWithFilters = ({
    nextStatus = status,
    nextWorkPlace = workPlace,
    nextWorkType = workType,
    nextUserName = userName,
    nextExtraWork = extraWork,
    nextRange = range,
  } = {}) => {
    if (!nextRange?.from) {
      toast({
        title: "날짜를 선택해주세요.",
        status: "warning",
        duration: 2000,
      });
      return;
    }

    fetchList({
      status: nextStatus,
      workPlace: nextWorkPlace,
      workType: nextWorkType,
      userName: nextUserName,
      extraWork: nextExtraWork,
      startDate: toYMD(nextRange.from),
      endDate: toYMD(nextRange.to ?? nextRange.from),
    });
  };

  useEffect(() => {
    searchWithFilters({
      nextStatus: APPROVAL_INITIAL_STATUS,
      nextWorkPlace: "",
      nextWorkType: "",
      nextUserName: "",
      nextExtraWork: "",
      nextRange: initialRange,
    });
    // initial load only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summary = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc.total += 1;
        if (row.status === "대기") acc.pending += 1;
        if (row.status === "승인") acc.approved += 1;
        if (isRejectedStatus(row.status)) acc.rejected += 1;
        if (row.workType === "주간") acc.day += 1;
        if (row.workType === "야간") acc.night += 1;
        if (String(row.workType || "").includes("특근")) acc.special += 1;
        return acc;
      },
      { total: 0, pending: 0, approved: 0, rejected: 0, day: 0, night: 0, special: 0 }
    );
  }, [rows]);

  const sortedRows = useMemo(() => {
    const nextRows = [...rows];
    const direction = sortOrder === "asc" ? 1 : -1;

    const compareText = (aValue, bValue, compareDirection = 1) =>
      String(aValue || "").localeCompare(String(bValue || ""), "ko") * compareDirection;

    nextRows.sort((a, b) => {
      if (sortField === "totalWorkMinutes") {
        const minutesCompare =
          ((Number(a.totalWorkMinutes) || 0) - (Number(b.totalWorkMinutes) || 0)) * direction;
        return minutesCompare || compareText(a.date, b.date, -1) || compareText(a.name, b.name);
      }

      if (sortField === "date") {
        return compareText(a.date, b.date, direction) || compareText(a.name, b.name);
      }

      if (sortField === "name") {
        return compareText(a.name, b.name, direction) || compareText(a.date, b.date, -1);
      }

      return compareText(a[sortField], b[sortField], direction);
    });

    return nextRows;
  }, [rows, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / APPROVAL_PAGE_SIZE));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * APPROVAL_PAGE_SIZE;
    return sortedRows.slice(start, start + APPROVAL_PAGE_SIZE);
  }, [currentPage, sortedRows]);

  const selectedRows = useMemo(
    () => rows.filter((row) => selectedIds.has(row.id)),
    [rows, selectedIds]
  );

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  useEffect(() => {
    setSelectedIds((prev) => {
      const availableIds = new Set(rows.map((row) => row.id));
      const next = new Set([...prev].filter((id) => availableIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [rows]);

  const rangeLabel = useMemo(() => {
    if (!range?.from) return "날짜 선택";
    if (!range?.to) return toYMD(range.from);
    return `${toYMD(range.from)} ~ ${toYMD(range.to)}`;
  }, [range]);

  const handleMonthChange = (monthValue) => {
    setSelectedMonth(monthValue);
    setRange(getMonthRange(monthValue));
  };

  const handleRangeChange = (nextRange) => {
    setSelectedMonth("");
    setRange(nextRange || { from: undefined, to: undefined });
  };

  const handleRangeReset = () => {
    setSelectedMonth("");
    setRange({ from: undefined, to: undefined });
  };

  const handleSearch = () => {
    setCurrentPage(1);
    clearSelection();
    searchWithFilters();
  };

  const handleSort = (field) => {
    setCurrentPage(1);
    setSortField((prevField) => {
      if (prevField === field) {
        setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
        return prevField;
      }

      setSortOrder("asc");
      return field;
    });
  };

  const handlePageChange = (page) => {
    clearSelection();
    setCurrentPage(page);
  };

  const handleTogglePage = (checked, ids) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => {
        if (checked) {
          next.add(id);
        } else {
          next.delete(id);
        }
      });
      return next;
    });
  };

  const toggleOne = (id, checked) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleResetFilters = () => {
    setStatus(APPROVAL_INITIAL_STATUS);
    setWorkPlace("");
    setWorkType("");
    setUserName("");
    setExtraWork("");
    setSortField("date");
    setSortOrder("desc");
    setCurrentPage(1);
    clearSelection();
  };

  const openDetail = (employee) => {
    setSelectedEmployee(employee);
    detailDisclosure.onOpen();
  };

  const handleExcelExport = async (_workPlace, date) => {
    try {
      setExportLoading(true);
      const result = await exportApprovalSalaryExcel(date);

      if (!result.success) {
        throw new Error(result.message || "엑셀 생성에 실패했습니다.");
      }

      toast({
        title: "엑셀 생성 완료",
        description: result.message || "승인관리 엑셀 파일이 Google Drive에 생성되었습니다.",
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
  };

  return {
    clearSelection,
    currentPage,
    detailDisclosure,
    exportLoading,
    extraWork,
    handleExcelExport,
    handleMonthChange,
    handlePageChange,
    handleRangeChange,
    handleRangeReset,
    handleResetFilters,
    handleSearch,
    handleSort,
    handleTogglePage,
    loading,
    openDetail,
    paginatedRows,
    range,
    rangeLabel,
    selectedEmployee,
    selectedIds,
    selectedMonth,
    selectedRows,
    setExtraWork,
    setStatus,
    setUserName,
    setWorkPlace,
    setWorkType,
    sortField,
    sortOrder,
    sortedRows,
    status,
    summary,
    toast,
    toggleOne,
    totalPages,
    userName,
    workPlace,
    workType,
  };
}
