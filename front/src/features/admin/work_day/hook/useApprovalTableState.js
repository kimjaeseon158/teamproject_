import { useEffect, useMemo, useState } from "react";

import { APPROVAL_PAGE_SIZE } from "../constants/approvalConstants";

const compareText = (aValue, bValue, compareDirection = 1) =>
  String(aValue || "").localeCompare(String(bValue || ""), "ko") * compareDirection;

export default function useApprovalTableState(rows) {
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const sortedRows = useMemo(() => {
    const nextRows = [...rows];
    const direction = sortOrder === "asc" ? 1 : -1;

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

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

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

  const resetSort = () => {
    setSortField("date");
    setSortOrder("desc");
  };

  return {
    currentPage,
    handleSort,
    paginatedRows,
    resetSort,
    setCurrentPage,
    sortField,
    sortOrder,
    sortedRows,
    totalPages,
  };
}
