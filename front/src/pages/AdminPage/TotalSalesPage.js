import { Box, Flex } from "@chakra-ui/react";

import ExcelExportModal from "../../features/admin/total_pay/section/ExcelExportModal";
import PayDetailSection from "../../features/admin/total_pay/section/PayDetailSection";
import ThreeMonthBarSection from "../../features/admin/total_pay/section/ThreeMonthBarSection";
import TotalSalesHeader from "../../features/admin/total_pay/section/TotalSalesHeader";
import TotalSalesSummaryCards from "../../features/admin/total_pay/section/TotalSalesSummaryCards";
import WorkerPaySummarySection from "../../features/admin/total_pay/section/WorkerPaySummarySection";
import useTotalSalesPage from "../../features/admin/total_pay/hook/useTotalSalesPage";

export default function TotalSalesPage() {
  const totalSales = useTotalSalesPage();

  return (
    <Box
      h="calc(100vh - 92px)"
      bg="gray.50"
      p={{ base: 4, md: 5 }}
      display="flex"
      flexDirection="column"
      overflowX="hidden"
      overflowY="auto"
    >
      <TotalSalesHeader
        apiMonth={totalSales.apiMonth}
        onMonthChange={totalSales.setApiMonth}
        onExcelOpen={totalSales.exportDisclosure.onOpen}
      />

      <TotalSalesSummaryCards
        selectedMonthTotal={totalSales.selectedMonthTotal}
        threeMonthTotal={totalSales.threeMonthTotal}
        detailCount={totalSales.detailData.length}
      />

      <Flex
        gap={5}
        align="stretch"
        direction={{ base: "column", xl: "row" }}
        flex="none"
        minH="auto"
        overflow="visible"
      >
        <Box flex="1.6" minW={0} display="flex" flexDirection="column" gap={3}>
          <Box
            h={{ base: "360px", md: "420px", xl: "460px" }}
            minH={{ base: "360px", md: "420px", xl: "460px" }}
            flexShrink={0}
          >
            <ThreeMonthBarSection
              data={totalSales.threeMonthData}
              selectedMonth={totalSales.selectedDetailMonth}
              height="100%"
              onMonthClick={(month) => {
                totalSales.setSelectedDetailMonth(String(month).trim());
              }}
            />
          </Box>

          <WorkerPaySummarySection
            selectedMonthTotal={totalSales.selectedMonthTotal}
            workerSummary={totalSales.workerSummary}
          />
        </Box>

        <PayDetailSection
          apiMonth={totalSales.apiMonth}
          detailData={totalSales.detailData}
          selectedDetailMonth={totalSales.selectedDetailMonth}
          selectedMonthTotal={totalSales.selectedMonthTotal}
          totalExpense={totalSales.totalExpense}
        />
      </Flex>

      <ExcelExportModal
        isOpen={totalSales.exportDisclosure.isOpen}
        onClose={totalSales.exportDisclosure.onClose}
        onConfirm={totalSales.handleExport}
        loading={totalSales.exportLoading}
      />
    </Box>
  );
}
