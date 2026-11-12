import { useBreakpointValue, useDisclosure } from "@chakra-ui/react";
import ApproveDetailModal from "../../features/admin/work_day/section/ApproveDetailModal";
import ExcelExportModal from "../../features/admin/total_pay/section/ExcelExportModal";
import useApprovalPage from "../../features/admin/work_day/hook/useApprovalPage";
import ApprovalMobileLayout from "../../features/admin/work_day/layout/ApprovalMobileLayout";
import ApprovalDesktopLayout from "../../features/admin/work_day/layout/ApprovalDesktopLayout";

export default function ApprovePage() {
  const exportDisclosure = useDisclosure();
  const approval = useApprovalPage({
    onExcelExportClose: exportDisclosure.onClose,
  });

  const mobile = useBreakpointValue({ base: true, md: false });
  const Layout = mobile ? ApprovalMobileLayout : ApprovalDesktopLayout;
  return <>
    <Layout approval={approval} onExcelOpen={exportDisclosure.onOpen} />
      <ApproveDetailModal
        employee={approval.selectedEmployee}
        isOpen={approval.detailDisclosure.isOpen}
        onClose={approval.detailDisclosure.onClose}
        onApprove={approval.approveEmployee}
        onReject={approval.rejectEmployee}
        saving={approval.detailSaving}
      />

      <ExcelExportModal
        isOpen={exportDisclosure.isOpen}
        onClose={exportDisclosure.onClose}
        onConfirm={approval.handleExcelExport}
        loading={approval.exportLoading}
        showWorkPlace={false}
      />
  </>;
}
