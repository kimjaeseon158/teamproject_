import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@chakra-ui/react";

import { exportUserPayExcel } from "../../api/google/GoogleDrive";
import { getAdminWorkPlaceList } from "../api/adminWorkPlace";
import { useDailyPay } from "./useWorkList";
import { userPlaceListColumns } from "../constants/dailyPayColumns";

const PAGE_SIZE = 8;

const formatWon = (value) => {
  if (value == null || Number.isNaN(Number(value))) return "-";
  return `${Number(value).toLocaleString()}원`;
};

const average = (arr) => {
  const valid = arr.filter((v) => v !== "" && v != null && !Number.isNaN(Number(v)));
  if (!valid.length) return null;

  return Math.round(
    valid.reduce((sum, value) => sum + Number(value), 0) / valid.length
  );
};

const averageRate = (rates, key) => average(rates.map((rate) => rate?.[key]));

const averageRateWithFallback = (rates, key, fallbackKey) =>
  average(rates.map((rate) => rate?.[key] ?? rate?.[fallbackKey]));

export default function useDailyPayPage({ onExcelExportClose } = {}) {
  const toast = useToast();
  const { data, loading, fetchDailyPay } = useDailyPay();

  const [exportLoading, setExportLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchUserName, setSearchUserName] = useState("");
  const [searchWorkPlace, setSearchWorkPlace] = useState("");
  const [adminWorkPlaces, setAdminWorkPlaces] = useState([]);
  const [workPlacesLoading, setWorkPlacesLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("user_name");
  const [sortOrder, setSortOrder] = useState("desc");

  const refreshDailyPay = useCallback(
    (params = {}) => fetchDailyPay(params, toast),
    [fetchDailyPay, toast]
  );

  useEffect(() => {
    refreshDailyPay();
  }, [refreshDailyPay]);

  const loadAdminWorkPlaces = useCallback(async () => {
    try {
      setWorkPlacesLoading(true);
      const workPlaces = await getAdminWorkPlaceList(toast);
      setAdminWorkPlaces(workPlaces);
    } catch (err) {
      toast({
        title: "관리자 근무지 목록을 불러오지 못했습니다.",
        description: err?.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setWorkPlacesLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAdminWorkPlaces();
  }, [loadAdminWorkPlaces]);

  const mergedData = useMemo(() => {
    return data?.map((user) => {
      const rates = user.rates || [];
      const workPlaces = rates.map((rate) => rate.work_place).filter(Boolean);

      return {
        user_uuid: user.user_uuid,
        user_name: user.user_name,
        work_place: workPlaces.join(" / "),
        base_hourly_wage: averageRate(rates, "base_hourly_wage"),
        overtime_hourly_wage: averageRate(rates, "overtime_hourly_wage"),
        meal_ot_hourly_wage: averageRate(rates, "meal_ot_hourly_wage"),
        special_hourly_wage: averageRate(rates, "special_hourly_wage"),
        day_special_hourly_wage: averageRateWithFallback(
          rates,
          "day_special_hourly_wage",
          "special_hourly_wage"
        ),
        night_special_hourly_wage: averageRateWithFallback(
          rates,
          "night_special_hourly_wage",
          "special_hourly_wage"
        ),
        overnight_hourly_wage: averageRate(rates, "overnight_hourly_wage"),
        overnight_ot_hourly_wage: averageRate(rates, "overnight_ot_hourly_wage"),
        early_hourly_wage: averageRate(rates, "early_hourly_wage"),
      };
    }) || [];
  }, [data]);

  const summary = useMemo(() => {
    const places = new Set();
    data?.forEach((user) => {
      user.rates?.forEach((rate) => {
        if (rate.work_place) places.add(rate.work_place);
      });
    });

    return {
      users: mergedData.length,
      places: places.size,
      averageBasePay: average(mergedData.map((row) => row.base_hourly_wage)),
    };
  }, [data, mergedData]);

  const sortedData = useMemo(() => {
    const nextData = [...mergedData];
    const direction = sortOrder === "asc" ? 1 : -1;

    const compareText = (aValue, bValue, compareDirection = 1) =>
      String(aValue || "").localeCompare(String(bValue || ""), "ko") * compareDirection;

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

  const displayColumns = useMemo(() => (
    userPlaceListColumns.map((column) => ({
      ...column,
      render:
        column.key.includes("wage")
          ? (value) => formatWon(value)
          : column.render,
    }))
  ), []);

  const statCards = useMemo(() => ([
    { label: "등록 직원(명)", value: `${summary.users.toLocaleString()}` },
    {
      label: "근무지 수",
      value: workPlacesLoading
        ? "..."
        : `${adminWorkPlaces.length.toLocaleString()}`,
    },
    { label: "평균 기본일급", value: formatWon(summary.averageBasePay) },
  ]), [adminWorkPlaces.length, summary.averageBasePay, summary.users, workPlacesLoading]);

  const handleEdit = useCallback((row) => {
    const user = data.find((item) => item.user_uuid === row.user_uuid);
    setSelectedUser(user);
  }, [data]);

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

  const handleSearch = useCallback(() => {
    setCurrentPage(1);
    refreshDailyPay({
      user_name: searchUserName,
      work_place: searchWorkPlace,
    });
  }, [refreshDailyPay, searchUserName, searchWorkPlace]);

  const handleResetSearch = useCallback(() => {
    setSearchUserName("");
    setSearchWorkPlace("");
    setCurrentPage(1);
    refreshDailyPay();
  }, [refreshDailyPay]);

  const handleRateSuccess = useCallback(() => {
    refreshDailyPay();
    setSelectedUser(null);
  }, [refreshDailyPay]);

  const handleAdminWorkPlaceSuccess = useCallback(() => {
    loadAdminWorkPlaces();
    refreshDailyPay();
  }, [loadAdminWorkPlaces, refreshDailyPay]);

  const handleExcelExport = useCallback(async (_workPlace, date) => {
    try {
      setExportLoading(true);
      const result = await exportUserPayExcel(date);

      if (!result.success) {
        throw new Error(result.message || "엑셀 생성에 실패했습니다.");
      }

      toast({
        title: "엑셀 생성 완료",
        description: result.message || "일급관리 엑셀 파일이 Google Drive에 생성되었습니다.",
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
  }, [onExcelExportClose, toast]);

  return {
    adminWorkPlaces,
    currentPage,
    displayColumns,
    exportLoading,
    handleAdminWorkPlaceSuccess,
    handleEdit,
    handleExcelExport,
    handleRateSuccess,
    handleResetSearch,
    handleSearch,
    handleSort,
    loading,
    mergedData,
    pagedData,
    searchUserName,
    searchWorkPlace,
    selectedUser,
    setCurrentPage,
    setSearchUserName,
    setSearchWorkPlace,
    setSelectedUser,
    sortField,
    sortOrder,
    statCards,
    totalPages,
    workPlacesLoading,
  };
}
