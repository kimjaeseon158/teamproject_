import { Box, useToast } from "@chakra-ui/react";

import AddPersonModal from "../../features/admin/userList/components/AddPersonModal";
import AdminInformation from "../../features/admin/userList/components/AdminInformation";
import EmployeeListHeader from "../../features/admin/userList/components/EmployeeListHeader";
import EmployeeTableSection from "../../features/admin/userList/components/EmployeeTableSection";
import SearchModal from "../../features/admin/userList/components/searchModal";
import { useEmployeeListPage } from "../../features/admin/userList/hook/useEmployeeListPage";

export default function EmployeeList() {
  const toast = useToast();
  const employeeList = useEmployeeListPage(toast);
  const { state, handlers } = employeeList;

  return (
    <Box minH="100vh" bg="gray.50" p={{ base: 4, md: 6 }}>
      <EmployeeListHeader
        hasSearchFilter={employeeList.hasSearchFilter}
        selectedCount={employeeList.selectedCount}
        onAdd={() => state.setShowAddModal(true)}
        onSearchOpen={() => state.setShowSearchModal(true)}
        onShowAll={handlers.handleShowAll}
        onDeleteSelected={handlers.handleDeleteSelected}
      />

      <EmployeeTableSection
        peopleData={state.peopleData}
        columns={employeeList.tableColumns}
        checkedItems={state.checkedItems}
        onCheck={handlers.handleCheckboxChange}
        selectAll={employeeList.selectAll}
        selectedCount={employeeList.selectedCount}
      />

      {state.selectedPerson && (
        <AdminInformation
          person={state.selectedPerson}
          onClose={() => state.setSelectedPerson(null)}
          onSave={handlers.handleSave}
          toast={toast}
        />
      )}

      {state.showAddModal && (
        <AddPersonModal
          isOpen
          onSave={(person) => {
            state.setPeopleData((prev) => [...prev, person]);
            state.setShowAddModal(false);
          }}
          onClose={() => state.setShowAddModal(false)}
          toast={toast}
        />
      )}

      <SearchModal
        isOpen={state.showSearchModal}
        onClose={handlers.handleCloseSearch}
        searchForm={state.searchForm}
        onChange={handlers.handleSearchChange}
        onSearch={handlers.applySearch}
      />
    </Box>
  );
}
