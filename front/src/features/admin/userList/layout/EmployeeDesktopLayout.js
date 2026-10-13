import { Box } from "@chakra-ui/react";
import EmployeeDesktopTable from "../components/EmployeeDesktopTable";
import ApprovePagination from "../../work_day/section/ApprovePagination";

export default function EmployeeDesktopLayout({ employeeList }) {
  const { state, handlers } = employeeList;
  return <Box>
      <EmployeeDesktopTable
        peopleData={employeeList.sortedPeople}
        columns={employeeList.tableColumns}
        checkedItems={state.checkedItems}
        onCheck={handlers.handleCheckboxChange}
        selectAll={employeeList.selectAll}
        selectedCount={employeeList.selectedCount}
        totalCount={state.pagination.total_count}
        onAdd={() => state.setShowAddModal(true)}
        onSearchOpen={handlers.openSearch}
        onReset={handlers.handleShowAll}
        resetLoading={handlers.showAllLoading}
        onDeleteSelected={handlers.handleDeleteSelected}
      />
      <ApprovePagination
        currentPage={state.pagination.page}
        totalPages={state.pagination.total_pages}
        totalCount={state.pagination.total_count}
        pageSize={state.pagination.page_size}
        onChange={handlers.handlePageChange}
      />
  </Box>;
}
