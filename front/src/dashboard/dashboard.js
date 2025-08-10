import { Flex, Box } from "@chakra-ui/react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/sideBar";
import Header from "./components/Header";

import Overview from "./pages/overview";
import EmployeeList from "./pages/EmployeeList";        // adminpage 연결
import ApprovalPage from "./pages/ApprovalPage";       // 승은 관련
import DailyPayPage from "./pages/DailyPayPage";       // 일급 관리
import TotalSalesPage from "./pages/TotalSalesPage";   // 총 매출액

export default function Dashboard() {
  return (
    <Flex h="100vh">
      <Sidebar />
      <Flex direction="column" flex="1">
        <Header />
        <Box p="4" flex="1" bg="gray.50" overflow="auto">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="admin" element={<EmployeeList />} />
            <Route path="approval" element={<ApprovalPage />} />
            <Route path="daily-pay" element={<DailyPayPage />} />
            <Route path="total-sales" element={<TotalSalesPage />} />
          </Routes>
        </Box>
      </Flex>
    </Flex>
  );
}
