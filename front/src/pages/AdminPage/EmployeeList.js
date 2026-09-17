import { Badge, Box, Tab, TabList, TabPanel, TabPanels, Tabs, useBreakpointValue, useToast } from "@chakra-ui/react";
import { useState } from "react";

import AddPersonModal from "../../features/admin/userList/components/AddPersonModal";
import AdminInformation from "../../features/admin/userList/components/AdminInformation";
import SearchModal from "../../features/admin/userList/components/searchModal";
import { useEmployeeListPage } from "../../features/admin/userList/hook/useEmployeeListPage";
import PasswordResetRequestSection from "../../features/admin/userList/components/PasswordResetRequestSection";

import EmployeeMobileLayout from "../../features/admin/userList/layout/EmployeeMobileLayout";
import EmployeeDesktopLayout from "../../features/admin/userList/layout/EmployeeDesktopLayout";

export default function EmployeeList() {
  const toast = useToast();
  const mobile = useBreakpointValue({ base: true, md: false });
  const Layout = mobile ? EmployeeMobileLayout : EmployeeDesktopLayout;
  const employeeList = useEmployeeListPage(toast);
  const { state, handlers } = employeeList;
  const [resetRequestCount, setResetRequestCount] = useState(0);

  return (
    <Box minH="100%" bg={{ base: "white", md: "gray.50" }} px={{ base: "clamp(18px, 5vw, 32px)", md: "clamp(24px, 2.5vw, 40px)" }} py={{ base: 5, md: 6 }}>
      <Tabs colorScheme="blue" variant="enclosed">
        <TabList mb={5}>
          <Tab>직원 목록</Tab>
          <Tab>초기화 요청 <Badge ml={2} colorScheme={resetRequestCount ? "red" : "gray"}>{resetRequestCount}</Badge></Tab>
        </TabList>
        <TabPanels p={0}>
          <TabPanel p={0}>
            <Layout employeeList={employeeList} />
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
          onSave={(users) => {
            if (Array.isArray(users)) state.setPeopleData(users);
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
