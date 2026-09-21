import { useState } from "react";

const SORT_FIELDS = {
  date: "work_date",
  name: "user_name",
  totalWorkMinutes: "total_work_minutes",
};

export default function useApprovalTableState() {
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const getOrdering = (field = sortField, order = sortOrder) => {
    const serverField = SORT_FIELDS[field];
    if (!serverField) return "-work_date";
    return order === "desc" ? `-${serverField}` : serverField;
  };

  const handleSort = (field) => {
    if (!SORT_FIELDS[field]) return getOrdering();

    const nextOrder = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setCurrentPage(1);
    setSortField(field);
    setSortOrder(nextOrder);
    return getOrdering(field, nextOrder);
  };

  const resetSort = () => {
    setSortField("date");
    setSortOrder("desc");
  };

  return {
    currentPage,
    getOrdering,
    handleSort,
    resetSort,
    setCurrentPage,
    sortField,
    sortOrder,
  };
}
