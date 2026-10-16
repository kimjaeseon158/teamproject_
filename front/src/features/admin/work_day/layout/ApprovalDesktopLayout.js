import { Box, Flex, Heading, HStack } from "@chakra-ui/react";
import ApprovalSummaryCards from "../section/ApprovalSummaryCards";
import ApprovalPageHeader from "../section/ApprovalPageHeader";
import ApprovalFilters from "../section/ApprovalFilters";
import ApprovalResults from "../section/ApprovalResults";
import ApproveBulkActionBar from "../section/ApproveBulkActionBar";

export default function ApprovalDesktopLayout({ approval, onExcelOpen }) {
  return <Box minH="100%" bg="gray.50" p={6}>
    <ApprovalSummaryCards summary={approval.summary} selectedCount={approval.selectedIds.size} />
    <Box bg="white" borderWidth="1px" borderColor="gray.100" borderRadius="lg" p={4}><ApprovalFilters approval={approval} /></Box>
    <Box mt={4} bg="white" borderWidth="1px" borderColor="gray.100" borderRadius="lg">
      <Flex justify="space-between" align="center" px={5} py={4} borderBottom="1px solid" borderColor="gray.100">
        <HStack spacing={3}>
          <Heading size="sm" color="gray.800">승인 내역</Heading>
          <ApprovalPageHeader onExcelOpen={onExcelOpen} />
        </HStack>
        <HStack spacing={3}><ApproveBulkActionBar selectedRows={approval.selectedRows} toast={approval.toast} clearSelection={approval.clearSelection} isDisabled={approval.loading} onBulkUpdate={approval.updateBulkStatus} saving={approval.bulkSaving} /></HStack>
      </Flex>
      <ApprovalResults approval={approval} />
    </Box>
  </Box>;
}
