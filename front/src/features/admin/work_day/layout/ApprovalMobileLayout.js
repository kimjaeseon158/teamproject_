import { Box } from "@chakra-ui/react";
import ApprovalPageHeader from "../section/ApprovalPageHeader";
import ApprovalFilters from "../section/ApprovalFilters";
import ApprovalResults from "../section/ApprovalResults";
import ApproveBulkActionBar from "../section/ApproveBulkActionBar";

export default function ApprovalMobileLayout({ approval }) {
  return <Box minH="100%" bg="white" p={4}>
    <ApprovalPageHeader loading={approval.loading} totalCount={approval.summary.total} />
    <ApprovalFilters approval={approval} />
    <Box mt={4}><ApprovalResults approval={approval} /></Box>
    <Box position="sticky" bottom={0} bg="white" borderTopWidth="1px" borderColor="gray.200" py={3} zIndex={2}>
      <ApproveBulkActionBar selectedRows={approval.selectedRows} toast={approval.toast} clearSelection={approval.clearSelection} isDisabled={approval.loading} onBulkUpdate={approval.updateBulkStatus} saving={approval.bulkSaving} />
    </Box>
  </Box>;
}
