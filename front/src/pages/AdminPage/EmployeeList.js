import { Badge, Box, Tab, TabList, TabPanel, TabPanels, Tabs, useToast } from "@chakra-ui/react";
import { useState } from "react";

import AddPersonModal from "../../features/admin/userList/components/AddPersonModal";
import AdminInformation from "../../features/admin/userList/components/AdminInformation";
import EmployeeListHeader from "../../features/admin/userList/components/EmployeeListHeader";
import EmployeeTableSection from "../../features/admin/userList/components/EmployeeTableSection";
import SearchModal from "../../features/admin/userList/components/searchModal";
import { useEmployeeListPage } from "../../features/admin/userList/hook/useEmployeeListPage";
import PasswordResetRequestSection from "../../features/admin/userList/components/PasswordResetRequestSection";

export default function EmployeeList() {
  const toast = useToast();
  const employeeList = useEmployeeListPage(toast);
  const { state, handlers } = employeeList;
  const [resetRequestCount, setResetRequestCount] = useState(0);

  return (
    <Box minH="100vh" bg="gray.50" p={{ base: 4, md: 6 }}>
      <Tabs colorScheme="blue" variant="enclosed">
        <TabList mb={5}>
          <Tab>직원 목록</Tab>
          <Tab>초기화 요청 <Badge ml={2} colorScheme={resetRequestCount ? "red" : "gray"}>{resetRequestCount}</Badge></Tab>
        </TabList>
        <TabPanels p={0}>
          <TabPanel p={0}>
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
          </TabPanel>
          <TabPanel p={0}>
            <PasswordResetRequestSection onCountChange={setResetRequestCount} />
          </TabPanel>
        </TabPanels>
      </Tabs>

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
