import { Box } from "@chakra-ui/react";
import EmployeeListHeader from "../components/EmployeeListHeader";
import EmployeeDesktopTable from "../components/EmployeeDesktopTable";

export default function EmployeeDesktopLayout({ employeeList }) {
  const { state, handlers } = employeeList;
  return <Box>
      <EmployeeListHeader
        hasSearchFilter={employeeList.hasSearchFilter}
        selectedCount={employeeList.selectedCount}
        onAdd={() => state.setShowAddModal(true)}
        onSearchOpen={() => state.setShowSearchModal(true)}
        onShowAll={handlers.handleShowAll}
        onDeleteSelected={handlers.handleDeleteSelected}
      />

      <EmployeeDesktopTable
        peopleData={state.peopleData}
        columns={employeeList.tableColumns}
        checkedItems={state.checkedItems}
        onCheck={handlers.handleCheckboxChange}
        selectAll={employeeList.selectAll}
        selectedCount={employeeList.selectedCount}
        onOpenPerson={state.setSelectedPerson}
      />
  </Box>;
}
