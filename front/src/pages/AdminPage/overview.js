import { Box, Flex, Grid } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import useOverviewPage from "../../features/admin/overview/hook/useOverviewPage";
import OverviewApprovalQueueSection from "../../features/admin/overview/section/OverviewApprovalQueueSection";
import OverviewCalendarSection from "../../features/admin/overview/section/OverviewCalendarSection";
import OverviewEmployeeSnapshotSection from "../../features/admin/overview/section/OverviewEmployeeSnapshotSection";
import OverviewFinanceSection from "../../features/admin/overview/section/OverviewFinanceSection";
import OverviewHeader from "../../features/admin/overview/section/OverviewHeader";
import OverviewKpiSection from "../../features/admin/overview/section/OverviewKpiSection";
import WidgetRestoreBar from "../../features/admin/overview/section/WidgetRestoreBar";

export default function OverviewPage() {
  const navigate = useNavigate();
  const overview = useOverviewPage();

  const goApproval = () => navigate("/dashboard/approval");

  return (
    <Box h="100%" minH="calc(100vh - 80px)" bg="gray.50" overflow="hidden">
      <Flex h="100%" direction="column" gap={3}>
        <OverviewHeader
          currentDate={overview.currentDate}
          googleStatus={overview.googleStatus}
          isLoading={overview.dailyPayLoading || overview.approvalLoading}
          onGoogleLogin={overview.handleGoogleLogin}
          onMonthChange={overview.handleMonthChange}
          onRefresh={overview.refresh}
        />

        <WidgetRestoreBar
          hiddenWidgets={overview.hiddenWidgets}
          onShow={overview.showWidget}
        />

        {overview.widgets.kpis && (
          <OverviewKpiSection
            kpis={overview.kpis}
            onNavigate={navigate}
            onRemove={() => overview.hideWidget("kpis")}
          />
        )}

        <Grid
          flex="1"
          minH={0}
          gap={3}
          templateColumns={{
            base: "1fr",
            xl: overview.widgets.calendar ? "minmax(0, 1.45fr) minmax(340px, 0.85fr)" : "1fr",
          }}
        >
          {overview.widgets.calendar && (
            <OverviewCalendarSection
              currentDate={overview.currentDate}
              events={overview.events}
              loading={overview.approvalLoading}
              onMoveMonth={overview.moveMonth}
              onNavigateApproval={goApproval}
              onRemove={() => overview.hideWidget("calendar")}
            />
          )}

          <Grid minH={0} gap={3} templateRows={overview.rightPanelRows}>
            {overview.widgets.approvalQueue && (
              <OverviewApprovalQueueSection
                summary={overview.approvalSummary}
                pendingPreview={overview.pendingPreview}
                onNavigateApproval={goApproval}
                onRemove={() => overview.hideWidget("approvalQueue")}
              />
            )}

            {overview.widgets.finance && (
              <OverviewFinanceSection
                threeMonthData={overview.threeMonthData}
                financeTotal={overview.financeTotal}
                onNavigateFinance={() => navigate("/dashboard/total-sales")}
                onRemove={() => overview.hideWidget("finance")}
              />
            )}

            {overview.widgets.employeeSnapshot && (
              <OverviewEmployeeSnapshotSection
                dailyPaySummary={overview.dailyPaySummary}
                onNavigateEmployee={() => navigate("/dashboard/admin")}
                onRemove={() => overview.hideWidget("employeeSnapshot")}
              />
            )}
          </Grid>
        </Grid>
      </Flex>
    </Box>
  );
}
