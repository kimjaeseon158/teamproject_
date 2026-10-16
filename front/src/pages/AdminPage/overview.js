import { Box, Flex } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

import useOverviewPage from "../../features/admin/overview/hook/useOverviewPage";
import OverviewApprovalQueueSection from "../../features/admin/overview/section/OverviewApprovalQueueSection";
import OverviewCalendarSection from "../../features/admin/overview/section/OverviewCalendarSection";
import OverviewEmployeeSnapshotSection from "../../features/admin/overview/section/OverviewEmployeeSnapshotSection";
import OverviewFinanceSection from "../../features/admin/overview/section/OverviewFinanceSection";
import OverviewKpiSection from "../../features/admin/overview/section/OverviewKpiSection";
import OverviewWidgetLayout from "../../features/admin/overview/components/OverviewWidgetLayout";
import { getGoogleExportReturnPath } from "../../features/admin/api/google/googleAuth";

export default function OverviewPage() {
  const navigate = useNavigate();
  const overview = useOverviewPage();

  useEffect(() => {
    const authResult = new URLSearchParams(window.location.search).get("google_auth");
    const returnPath = getGoogleExportReturnPath();
    if (authResult === "success" && returnPath?.startsWith("/dashboard/")) {
      navigate(returnPath, { replace: true });
    }
  }, [navigate]);

  const goApproval = () => navigate("/dashboard/approval");

  return (
    <Box minH="calc(100vh - 80px)" bg="gray.50" overflow="hidden">
      <Flex direction="column" gap={3}>
        <OverviewWidgetLayout widgets={{
          kpis: <OverviewKpiSection kpis={overview.kpis} onNavigate={navigate} />,
          calendar: <OverviewCalendarSection
            currentDate={overview.currentDate}
            events={overview.events}
            loading={overview.approvalLoading}
            onMoveMonth={overview.moveMonth}
            onMonthChange={overview.handleMonthChange}
            onNavigateApproval={goApproval}
          />,
          approvalQueue: <OverviewApprovalQueueSection
            summary={overview.approvalSummary}
            pendingPreview={overview.pendingPreview}
            loading={overview.approvalLoading}
            onNavigateApproval={goApproval}
          />,
          finance: <OverviewFinanceSection
            threeMonthData={overview.threeMonthData}
            financeTotal={overview.financeTotal}
            onNavigateFinance={() => navigate("/dashboard/total-sales")}
          />,
          employeeSnapshot: <OverviewEmployeeSnapshotSection
            dailyPaySummary={overview.dailyPaySummary}
            onNavigateEmployee={() => navigate("/dashboard/admin")}
          />,
        }} />
      </Flex>
    </Box>
  );
}
