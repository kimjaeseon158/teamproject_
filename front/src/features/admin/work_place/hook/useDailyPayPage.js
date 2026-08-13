import { useCallback, useEffect, useState } from "react";
import { useToast } from "@chakra-ui/react";

import useAdminWorkPlaces from "./useAdminWorkPlaces";
import { useDailyPay } from "./useWorkList";
import useDailyPayDerivedData from "./useDailyPayDerivedData";
import useDailyPayExport from "./useDailyPayExport";
import useDailyPayTableState from "./useDailyPayTableState";

export default function useDailyPayPage({ onExcelExportClose } = {}) {
  const toast = useToast();
  const { data, loading, fetchDailyPay } = useDailyPay();
  const { adminWorkPlaces, loadAdminWorkPlaces, workPlacesLoading } =
    useAdminWorkPlaces(toast);

  const [selectedUser, setSelectedUser] = useState(null);
  const [searchUserName, setSearchUserName] = useState("");
  const [searchWorkPlace, setSearchWorkPlace] = useState("");

  const refreshDailyPay = useCallback(
    (params = {}) => fetchDailyPay(params, toast),
    [fetchDailyPay, toast]
  );

  useEffect(() => {
    refreshDailyPay();
  }, [refreshDailyPay]);

  const { displayColumns, mergedData, statCards } = useDailyPayDerivedData({
    adminWorkPlaces,
    data,
    workPlacesLoading,
  });
  const table = useDailyPayTableState(mergedData);
  const dailyPayExport = useDailyPayExport({ onExcelExportClose, toast });
  const { setCurrentPage } = table;

  const handleEdit = useCallback((row) => {
    const user = data.find((item) => item.user_uuid === row.user_uuid);
    setSelectedUser(user);
  }, [data]);

  const handleSearch = useCallback(() => {
    setCurrentPage(1);
    refreshDailyPay({
      user_name: searchUserName,
      work_place: searchWorkPlace,
    });
  }, [refreshDailyPay, searchUserName, searchWorkPlace, setCurrentPage]);

  const handleResetSearch = useCallback(() => {
    setSearchUserName("");
    setSearchWorkPlace("");
    setCurrentPage(1);
    refreshDailyPay();
  }, [refreshDailyPay, setCurrentPage]);

  const handleRateSuccess = useCallback(() => {
    refreshDailyPay();
    setSelectedUser(null);
  }, [refreshDailyPay]);

  const handleAdminWorkPlaceSuccess = useCallback(() => {
    loadAdminWorkPlaces();
    refreshDailyPay();
  }, [loadAdminWorkPlaces, refreshDailyPay]);

  return {
    adminWorkPlaces,
    currentPage: table.currentPage,
    displayColumns,
    exportLoading: dailyPayExport.exportLoading,
    handleAdminWorkPlaceSuccess,
    handleEdit,
    handleExcelExport: dailyPayExport.handleExcelExport,
    handleRateSuccess,
    handleResetSearch,
    handleSearch,
    handleSort: table.handleSort,
    loading,
    mergedData,
    pagedData: table.pagedData,
    searchUserName,
    searchWorkPlace,
    selectedUser,
    setCurrentPage: table.setCurrentPage,
    setSearchUserName,
    setSearchWorkPlace,
    setSelectedUser,
    sortField: table.sortField,
    sortOrder: table.sortOrder,
    statCards,
    totalPages: table.totalPages,
    workPlacesLoading,
  };
}
