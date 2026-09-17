import { Box } from "@chakra-ui/react";
import EmployeeListHeader from "../components/EmployeeListHeader";
import EmployeeMobileTable from "../components/EmployeeMobileTable";

export default function EmployeeMobileLayout({ employeeList }) {
  const { state, handlers } = employeeList;
  return <Box>
      <EmployeeListHeader
        hasSearchFilter={employeeList.hasSearchFilter}
        selectedCount={employeeList.selectedCount}
        onAdd={() => state.setShowAddModal(true)}
        onSearchOpen={handlers.openSearch}
        onShowAll={handlers.handleShowAll}
        showAllLoading={handlers.showAllLoading}
        onDeleteSelected={handlers.handleDeleteSelected}
      />

      <EmployeeMobileTable
        peopleData={employeeList.sortedPeople}
        columns={employeeList.tableColumns}
        checkedItems={state.checkedItems}
        onCheck={handlers.handleCheckboxChange}
        selectAll={employeeList.selectAll}
        selectedCount={employeeList.selectedCount}
        onOpenPerson={state.setSelectedPerson}
      />
  </Box>;
}
