import { useEffect, useMemo, useState } from "react";

export default function useApprovalSelection(rows) {
  const [selectedIds, setSelectedIds] = useState(new Set());

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const selectedRows = useMemo(
    () => rows.filter((row) => selectedIds.has(row.id)),
    [rows, selectedIds]
  );

  useEffect(() => {
    setSelectedIds((prev) => {
      const availableIds = new Set(rows.map((row) => row.id));
      const next = new Set([...prev].filter((id) => availableIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [rows]);

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

  return {
    clearSelection,
    handleTogglePage,
    selectedIds,
    selectedRows,
    toggleOne,
  };
}
