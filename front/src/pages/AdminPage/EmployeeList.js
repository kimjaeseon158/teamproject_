import { Badge, Box, Tab, TabList, TabPanel, TabPanels, Tabs, useBreakpointValue, useDisclosure, useToast } from "@chakra-ui/react";
import { useState } from "react";

import AddPersonModal from "../../features/admin/userList/components/AddPersonModal";
import AdminInformation from "../../features/admin/userList/components/AdminInformation";
import SearchModal from "../../features/admin/userList/components/searchModal";
import { useEmployeeListPage } from "../../features/admin/userList/hook/useEmployeeListPage";
import PasswordResetRequestSection from "../../features/admin/userList/components/PasswordResetRequestSection";
import EmployeeExcelImportModal from "../../features/admin/userList/components/EmployeeExcelImportModal";

import EmployeeMobileLayout from "../../features/admin/userList/layout/EmployeeMobileLayout";
import EmployeeDesktopLayout from "../../features/admin/userList/layout/EmployeeDesktopLayout";
import { fetchAllEmployeesForExcel } from "../../features/admin/userList/api/admnsdbPost";
import { downloadEmployeeExcel } from "../../features/admin/userList/utils/employeeExcel";

export default function EmployeeList() {
  const toast = useToast();
  const mobile = useBreakpointValue({ base: true, md: false });
  const Layout = mobile ? EmployeeMobileLayout : EmployeeDesktopLayout;
  const employeeList = useEmployeeListPage(toast);
  const excelImportDisclosure = useDisclosure();
  const { state, handlers } = employeeList;
  const [resetRequestCount, setResetRequestCount] = useState(0);
  const [excelDownloading, setExcelDownloading] = useState(false);

  const handleDownloadAllEmployees = async () => {
    if (excelDownloading) return;
    setExcelDownloading(true);
    try {
      const response = await fetchAllEmployeesForExcel();
      if (!response?.success || !Array.isArray(response.users)) {
        throw new Error("전체 직원 정보를 불러오지 못했습니다. 다시 시도해 주세요.");
      }
      await downloadEmployeeExcel(response.users);
      toast({
        title: "직원 목록 다운로드 완료",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "직원 목록 다운로드 실패",
        description: error?.message || "엑셀 파일을 만들지 못했습니다.",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setExcelDownloading(false);
    }
  };

  return (
    <Box minH="100%" bg={{ base: "white", md: "gray.50" }} px={{ base: "clamp(18px, 5vw, 32px)", md: "clamp(24px, 2.5vw, 40px)" }} py={{ base: 5, md: 6 }}>
      <Tabs colorScheme="blue" variant="enclosed">
        <TabList mb={5}>
          <Tab>직원 목록</Tab>
          <Tab>초기화 요청 <Badge ml={2} colorScheme={resetRequestCount ? "red" : "gray"}>{resetRequestCount}</Badge></Tab>
        </TabList>
        <TabPanels p={0}>
          <TabPanel p={0}>
            <Layout
              employeeList={employeeList}
              onExcelImport={excelImportDisclosure.onOpen}
              onExcelDownloadAll={handleDownloadAllEmployees}
              excelDownloading={excelDownloading}
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
          onSave={() => {
            handlers.handleAddSuccess();
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

      <EmployeeExcelImportModal
        isOpen={excelImportDisclosure.isOpen}
        onClose={excelImportDisclosure.onClose}
        onSuccess={handlers.handleAddSuccess}
        toast={toast}
      />
    </Box>
  );
}
