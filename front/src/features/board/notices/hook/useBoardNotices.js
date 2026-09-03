import { useCallback, useEffect, useState } from "react";
import { useToast } from "@chakra-ui/react";

import { useUser } from "../../../auth/userContext";
import { fetchNotices } from "../api/boardNotices";

const INITIAL_DATA = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

export default function useBoardNotices() {
  const toast = useToast();
  const { loginType } = useUser();
  const [data, setData] = useState(INITIAL_DATA);
  const [filters, setFilters] = useState({ title: "", author: "" });
  const [appliedFilters, setAppliedFilters] = useState({ title: "", author: "" });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!loginType) return;
    setLoading(true);
    setError(null);
    try {
      setData(
        await fetchNotices({ loginType, ...appliedFilters, page }, { toast })
      );
    } catch (loadError) {
      setError(loadError);
      setData(INITIAL_DATA);
      toast({
        title: "공지사항을 불러오지 못했습니다.",
        description: loadError.message,
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, loginType, page, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const search = () => {
    setPage(1);
    setAppliedFilters({
      title: filters.title.trim(),
      author: filters.author.trim(),
    });
  };

  return {
    ...data,
    error,
    filters,
    loading,
    page,
    reload: load,
    search,
    setFilters,
    setPage,
    totalPages: Math.max(1, Math.ceil(data.count / 20)),
  };
}
