import ApproveTable from "./ApproveTable";
import ApprovePagination from "./ApprovePagination";

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
          totalCount={approval.totalCount}
          pageSize={approval.pageSize}
          onChange={approval.handlePageChange}
        />

 </>;
}
