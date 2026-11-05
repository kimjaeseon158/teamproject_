import ExcelActionMenu from "../../components/ExcelActionMenu";


export default function ApprovalPageHeader({ onExcelOpen }) {
  return (
    <ExcelActionMenu
      display={{ base: "none", md: "block" }}
      onExport={onExcelOpen}
    />
  );
}
