import { Box, Flex } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import useOverviewPage from "../../features/admin/overview/hook/useOverviewPage";
import OverviewApprovalQueueSection from "../../features/admin/overview/section/OverviewApprovalQueueSection";
import OverviewCalendarSection from "../../features/admin/overview/section/OverviewCalendarSection";
import OverviewEmployeeSnapshotSection from "../../features/admin/overview/section/OverviewEmployeeSnapshotSection";
import OverviewFinanceSection from "../../features/admin/overview/section/OverviewFinanceSection";
import OverviewHeader from "../../features/admin/overview/section/OverviewHeader";
import OverviewKpiSection from "../../features/admin/overview/section/OverviewKpiSection";
import OverviewWidgetLayout from "../../features/admin/overview/components/OverviewWidgetLayout";

export default function OverviewPage() {
  const navigate = useNavigate();
  const overview = useOverviewPage();

  const goApproval = () => navigate("/dashboard/approval");

  return (
    <Box minH="calc(100vh - 80px)" bg="gray.50" overflow="hidden">
      <Flex direction="column" gap={3}>
        <OverviewHeader
          currentDate={overview.currentDate}
          googleStatus={overview.googleStatus}
          isLoading={overview.dailyPayLoading || overview.approvalLoading}
          onGoogleLogin={overview.handleGoogleLogin}
          onMonthChange={overview.handleMonthChange}
          onRefresh={overview.refresh}
        />

        <OverviewWidgetLayout widgets={{
          kpis: <OverviewKpiSection kpis={overview.kpis} onNavigate={navigate} />,
          calendar: <OverviewCalendarSection
            currentDate={overview.currentDate}
            events={overview.events}
            loading={overview.approvalLoading}
            onMoveMonth={overview.moveMonth}
            onNavigateApproval={goApproval}
          />,
          approvalQueue: <OverviewApprovalQueueSection
            summary={overview.approvalSummary}
            pendingPreview={overview.pendingPreview}
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
