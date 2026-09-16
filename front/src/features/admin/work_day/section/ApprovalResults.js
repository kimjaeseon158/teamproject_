import ApproveTable from "./ApproveTable";
import ApprovePagination from "./ApprovePagination";
import { APPROVAL_PAGE_SIZE } from "../constants/approvalConstants";

export default function ApprovalResults({ approval }) {
 return <>
        <ApproveTable
          rows={approval.paginatedRows}
          selectedIds={approval.selectedIds}
          toggleAll={approval.handleTogglePage}
          toggleOne={approval.toggleOne}
          onRowClick={approval.openDetail}
          sortField={approval.sortField}
          sortOrder={approval.sortOrder}
          onSort={approval.handleSort}
        />

        <ApprovePagination
          currentPage={approval.currentPage}
          totalPages={approval.totalPages}
          totalCount={approval.sortedRows.length}
          pageSize={APPROVAL_PAGE_SIZE}
          onChange={approval.handlePageChange}
        />

 </>;
}
