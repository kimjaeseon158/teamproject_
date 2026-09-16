import { useBreakpointValue } from "@chakra-ui/react";
import { Navigate, Routes, Route } from "react-router-dom";
import AdminMobileLayout from "../features/admin/layout/AdminMobileLayout";
import AdminDesktopLayout from "../features/admin/layout/AdminDesktopLayout";

import Overview from "./AdminPage/overview";
import EmployeeList from "./AdminPage/EmployeeList";        // adminpage 연결
import ApprovalPage from "./AdminPage/ApprovalPage";       // 승은 관련
import DailyPayPage from "./AdminPage/DailyPayPage";       // 일급 관리
import TotalSalesPage from "./AdminPage/TotalSalesPage";   // 총 매출액
import TotalOverviewPage from "./AdminPage/TotalOverviewPage";
import WorkScheduleManagementPage from "./AdminPage/WorkScheduleManagementPage";
import CompanyPage from "./AdminPage/TotalEdit_company";
import ExpensePage from "./AdminPage/TotalEdit_expense";

export default function Dashboard() {
  const desktop = useBreakpointValue({ base: false, md: true });
  const Layout = desktop ? AdminDesktopLayout : AdminMobileLayout;
  return (
    <Layout>
          <Routes>
            <Route path="/" element={desktop === false ? <Navigate to="/dashboard/approval" replace /> : <Overview />} />
            <Route path="admin" element={<EmployeeList />} />
            <Route path="approval" element={<ApprovalPage />} />
            <Route path="daily-pay" element={<DailyPayPage />} />
            <Route path="work-schedules" element={<WorkScheduleManagementPage />} />
            <Route path="total-sales" element={<TotalOverviewPage />} />
            <Route path="total-sales/salary" element={<TotalSalesPage />} />
            <Route path="total-sales/company" element={<CompanyPage />} />
            <Route path="total-sales/expense" element={<ExpensePage />} />
          </Routes>
    </Layout>
  );
}
