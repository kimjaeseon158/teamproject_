import { useState } from "react";

const SORT_FIELDS = new Set(["date", "name", "totalWorkMinutes"]);

export default function useApprovalTableState() {
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (field) => {
    if (!SORT_FIELDS.has(field)) return;

    const nextOrder = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setCurrentPage(1);
    setSortField(field);
    setSortOrder(nextOrder);
  };

  const resetSort = () => {
    setSortField("date");
    setSortOrder("desc");
  };

  return {
    currentPage,
    handleSort,
    resetSort,
    setCurrentPage,
    sortField,
    sortOrder,
  };
}
