import { Box, useDisclosure } from "@chakra-ui/react";

import AddRateModal from "../../features/admin/work_place/components/AddRateModal";
import AdminWorkPlaceModal from "../../features/admin/work_place/components/AdminWorkPlaceModal";
import DailyPayFilterBar from "../../features/admin/work_place/components/DailyPayFilterBar";
import DailyPaySummaryCards from "../../features/admin/work_place/components/DailyPaySummaryCards";
import DailyPayTableSection from "../../features/admin/work_place/components/DailyPayTableSection";
import ExcelExportModal from "../../features/admin/total_pay/section/ExcelExportModal";
import useDailyPayPage from "../../features/admin/work_place/hook/useDailyPayPage";

export default function DailyPayPage() {
  const adminWorkPlaceDisclosure = useDisclosure();
  const exportDisclosure = useDisclosure();
  const dailyPay = useDailyPayPage();

  const handleExcelExport = async (_workPlace, date) => {
    const success = await dailyPay.handleExcelExport(date);
    if (success) exportDisclosure.onClose();
  };

  const statCards = dailyPay.statCards.map((card) => (
    card.label === "근무지 수"
      ? { ...card, action: adminWorkPlaceDisclosure.onOpen }
      : card
  ));

  return (
    <Box minH="100%" bg="gray.50" p={{ base: 4, md: 6 }} maxW="100%" overflowX="hidden">

      <DailyPaySummaryCards cards={statCards} />

      <DailyPayFilterBar
        onResetSearch={dailyPay.handleResetSearch}
        adminWorkPlaces={dailyPay.adminWorkPlaces}
        loading={dailyPay.loading}
        searchUserName={dailyPay.searchUserName}
        searchWorkPlace={dailyPay.searchWorkPlace}
        workPlacesLoading={dailyPay.workPlacesLoading}
        onSearch={dailyPay.handleSearch}
        onUserNameChange={dailyPay.setSearchUserName}
        onWorkPlaceChange={dailyPay.setSearchWorkPlace}
      />

      <DailyPayTableSection
        columns={dailyPay.displayColumns}
        currentPage={dailyPay.currentPage}
        data={dailyPay.pagedData}
        totalCount={dailyPay.mergedData.length}
        totalPages={dailyPay.totalPages}
        pageSize={dailyPay.pageSize}
        onEdit={dailyPay.handleEdit}
        onPageChange={dailyPay.setCurrentPage}
        onPageSizeChange={(pageSize) => {
          dailyPay.setPageSize(pageSize);
          dailyPay.setCurrentPage(1);
        }}
        onSort={dailyPay.handleSort}
        sortField={dailyPay.sortField}
        sortOrder={dailyPay.sortOrder}
        onExcelOpen={exportDisclosure.onOpen}
      />

      {dailyPay.selectedUser && (
        <AddRateModal
          isOpen
          mode="edit"
          user={dailyPay.selectedUser}
          onClose={() => dailyPay.setSelectedUser(null)}
          onSuccess={dailyPay.handleRateSuccess}
          initialAdminWorkPlaces={dailyPay.adminWorkPlaces}
        />
      )}

      <AdminWorkPlaceModal
        isOpen={adminWorkPlaceDisclosure.isOpen}
        onClose={adminWorkPlaceDisclosure.onClose}
        workPlaceCount={dailyPay.adminWorkPlaces.length}
        workPlaces={dailyPay.adminWorkPlaces}
        onSuccess={dailyPay.handleAdminWorkPlaceSuccess}
      />

      <ExcelExportModal
        isOpen={exportDisclosure.isOpen}
        onClose={exportDisclosure.onClose}
        onConfirm={handleExcelExport}
        loading={dailyPay.exportLoading}
        showWorkPlace={false}
      />

    </Box>
  );
}
