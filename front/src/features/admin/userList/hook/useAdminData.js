import { useCallback, useEffect } from "react";

import { fetchEmployees } from "../api/admnsdbPost";

export function useAdminData(state, toast) {
  const {
    activeFilters,
    ordering,
    pagination,
    setLoading,
    setPagination,
    setPeopleData,
  } = state;

  const loadEmployees = useCallback(async ({ filters = activeFilters, ...overrides } = {}) => {
    const requestedPage = overrides.page ?? pagination.page;
    setLoading(true);
    try {
      const res = await fetchEmployees({
        page: requestedPage,
        page_size: 10,
        ordering,
        ...filters,
        ...overrides,
      }, toast);

      if (res?.success && Array.isArray(res.users)) {
        const nextPagination = res.pagination || {
          page: requestedPage,
          page_size: 10,
          total_count: res.users.length,
          total_pages: 1,
        };
        const lastPage = Math.max(1, Number(nextPagination.total_pages) || 1);

        if (requestedPage > lastPage) {
          setPagination((current) => ({ ...current, page: lastPage }));
          return res;
        }

        setPeopleData(res.users);
        setPagination(nextPagination);
      }
      return res;
    } finally {
      setLoading(false);
    }
  }, [activeFilters, ordering, pagination.page, setLoading, setPagination, setPeopleData, toast]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  return { loadEmployees };
}
