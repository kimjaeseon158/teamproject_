import { Flex, Box } from "@chakra-ui/react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "../feactures/admin/components/sideBar";
import Header from "../feactures/admin/components/Header";

import Overview from "./AdminPage/overview";
import EmployeeList from "./AdminPage/EmployeeList";        // adminpage 연결
import ApprovalPage from "./AdminPage/ApprovalPage";       // 승은 관련
import DailyPayPage from "./AdminPage/DailyPayPage";       // 일급 관리
import TotalSalesPage from "./AdminPage/TotalSalesPage";   // 총 매출액
// import CompanyPage from "./AdminPage/TotalEdit_company";
// import ExpensePage from "./AdminPage/TotalEdit_expense";

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
            {/* <Route path="total-sales/company" element={<CompanyPage/>}/>
            <Route path="total-sales/expense" element={<ExpensePage/>}/> */}
          </Routes>
        </Box>
      </Flex>
    </Flex>
  );
}
