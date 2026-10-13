import { useState } from "react";
import { DEFAULT_TABLE_PAGE_SIZE } from "../../../../constants/pagination";

const SORT_FIELDS = new Set(["date", "name", "totalWorkMinutes"]);

export default function useApprovalTableState() {
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_TABLE_PAGE_SIZE);

  const handleSort = (field) => {
    if (!SORT_FIELDS.has(field)) return;

    const nextOrder = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setCurrentPage(1);
    setSortField(field);
    setSortOrder(nextOrder);
  };

  const handleSortDescending = (field) => {
    if (!SORT_FIELDS.has(field)) return;
    setCurrentPage(1);
    setSortField(field);
    setSortOrder("desc");
  };

  const resetSort = () => {
    setSortField("date");
    setSortOrder("desc");
  };

  return {
    currentPage,
    handleSort,
    handleSortDescending,
    pageSize,
    resetSort,
    setCurrentPage,
    setPageSize,
    sortField,
    sortOrder,
  };
}
