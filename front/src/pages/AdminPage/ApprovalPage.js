import { Box, Flex, Heading, HStack, Text, useDisclosure } from "@chakra-ui/react";

import ApproveBulkActionBar from "../../features/admin/work_day/section/ApproveBulkActionBar";
import ApproveDetailModal from "../../features/admin/work_day/section/ApproveDetailModal";
import ApproveFilterBar from "../../features/admin/work_day/section/ApproveFilterBar";
import ApprovePagination from "../../features/admin/work_day/section/ApprovePagination";
import ApproveTable from "../../features/admin/work_day/section/ApproveTable";
import ApprovalPageHeader from "../../features/admin/work_day/section/ApprovalPageHeader";
import ApprovalSummaryCards from "../../features/admin/work_day/section/ApprovalSummaryCards";
import ExcelExportModal from "../../features/admin/total_pay/section/ExcelExportModal";
import useApprovalPage from "../../features/admin/work_day/hook/useApprovalPage";
import { APPROVAL_PAGE_SIZE } from "../../features/admin/work_day/constants/approvalConstants";

export default function ApprovePage() {
  const exportDisclosure = useDisclosure();
  const approval = useApprovalPage({
    onExcelExportClose: exportDisclosure.onClose,
  });

  return (
    <Box minH="100vh" bg="gray.50" p={{ base: 4, md: 6 }}>
      <ApprovalPageHeader
        loading={approval.loading}
        totalCount={approval.summary.total}
        onExcelOpen={exportDisclosure.onOpen}
      />

      <ApprovalSummaryCards
        summary={approval.summary}
        selectedCount={approval.selectedIds.size}
      />

      <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="lg" p={4} boxShadow="sm">
        <ApproveFilterBar
          status={approval.status}
          setStatus={approval.setStatus}
          workPlace={approval.workPlace}
          setWorkPlace={approval.setWorkPlace}
          workType={approval.workType}
          setWorkType={approval.setWorkType}
          userName={approval.userName}
          setUserName={approval.setUserName}
          extraWork={approval.extraWork}
          setExtraWork={approval.setExtraWork}
          range={approval.range}
          setRange={approval.handleRangeChange}
          rangeLabel={approval.rangeLabel}
          selectedMonth={approval.selectedMonth}
          onMonthChange={approval.handleMonthChange}
          onRangeReset={approval.handleRangeReset}
          onReset={approval.handleResetFilters}
          loading={approval.loading}
          onSearch={approval.handleSearch}
        />
      </Box>

      <Box mt={4} bg="white" border="1px solid" borderColor="gray.100" borderRadius="lg" boxShadow="sm" overflow="hidden">
        <Flex justify="space-between" align="center" px={5} py={4} borderBottom="1px solid" borderColor="gray.100">
          <Box>
            <Heading size="sm" color="gray.800">
              승인 내역
            </Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>
              주간 {approval.summary.day} · 야간 {approval.summary.night} · 특근 {approval.summary.special}
            </Text>
          </Box>
          <HStack spacing={3}>
            <ApproveBulkActionBar
              selectedRows={approval.selectedRows}
              toast={approval.toast}
              clearSelection={approval.clearSelection}
              isDisabled={approval.loading}
              onBulkUpdate={approval.updateBulkStatus}
              saving={approval.bulkSaving}
            />
          </HStack>
        </Flex>

        <ApproveTable
          rows={approval.paginatedRows}
          selectedIds={approval.selectedIds}
          toggleAll={approval.handleTogglePage}
          toggleOne={approval.toggleOne}
          onRowClick={approval.openDetail}
          sortField={approval.sortField}
          sortOrder={approval.sortOrder}
          onSort={approval.handleSort}
        />

        <ApprovePagination
          currentPage={approval.currentPage}
          totalPages={approval.totalPages}
          totalCount={approval.sortedRows.length}
          pageSize={APPROVAL_PAGE_SIZE}
          onChange={approval.handlePageChange}
        />
      </Box>

      <ApproveDetailModal
        employee={approval.selectedEmployee}
        isOpen={approval.detailDisclosure.isOpen}
        onClose={approval.detailDisclosure.onClose}
        onApprove={approval.approveEmployee}
        onReject={approval.rejectEmployee}
        saving={approval.detailSaving}
      />

      <ExcelExportModal
        isOpen={exportDisclosure.isOpen}
        onClose={exportDisclosure.onClose}
        onConfirm={approval.handleExcelExport}
        loading={approval.exportLoading}
        showWorkPlace={false}
      />
    </Box>
  );
}
