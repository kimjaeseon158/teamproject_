import { useCallback, useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 8;

const compareText = (aValue, bValue, compareDirection = 1) =>
  String(aValue || "").localeCompare(String(bValue || ""), "ko") * compareDirection;

export default function useDailyPayTableState(mergedData) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("user_name");
  const [sortOrder, setSortOrder] = useState("desc");

  const sortedData = useMemo(() => {
    const nextData = [...mergedData];
    const direction = sortOrder === "asc" ? 1 : -1;

    nextData.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const aNumber = Number(aValue);
      const bNumber = Number(bValue);

      if (!Number.isNaN(aNumber) && !Number.isNaN(bNumber)) {
        return (aNumber - bNumber) * direction || compareText(a.user_name, b.user_name);
      }

      if (sortField === "user_name") {
        return compareText(a.user_name, b.user_name, direction) || compareText(a.work_place, b.work_place);
      }

      if (sortField === "work_place") {
        return compareText(a.work_place, b.work_place, direction) || compareText(a.user_name, b.user_name);
      }

      return compareText(aValue, bValue, direction) || compareText(a.user_name, b.user_name);
    });

    return nextData;
  }, [mergedData, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / PAGE_SIZE));
  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedData.slice(start, start + PAGE_SIZE);
  }, [currentPage, sortedData]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const handleSort = useCallback((field) => {
    setCurrentPage(1);
    setSortField((prevField) => {
      if (prevField === field) {
        setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
        return prevField;
      }

      setSortOrder("asc");
      return field;
    });
  }, []);

  return {
    currentPage,
    handleSort,
    pagedData,
    setCurrentPage,
    sortField,
    sortOrder,
    totalPages,
  };
}
