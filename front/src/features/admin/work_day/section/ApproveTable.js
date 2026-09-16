import { useBreakpointValue } from "@chakra-ui/react";
import ApproveMobileTable from "./ApproveMobileTable";
import ApproveDesktopTable from "./ApproveDesktopTable";

export default function ApproveTable(props) {
  const mobile = useBreakpointValue({ base: true, md: false });
  const selectableIds = props.rows.map(row => row.id);
  const selectedOnPageCount = selectableIds.filter(id => props.selectedIds.has(id)).length;
  const Table = mobile ? ApproveMobileTable : ApproveDesktopTable;
  return <Table {...props} selectableIds={selectableIds} selectedOnPageCount={selectedOnPageCount} />;
}
