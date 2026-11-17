import { Button, HStack } from "@chakra-ui/react";
import { FiDownload, FiUpload } from "react-icons/fi";

export default function EmployeeExcelActions({
  buttonSize = "sm",
  buttonMinH,
  buttonPx,
  downloading = false,
  onDownloadAll,
  onExcelImport,
}) {
  return (
    <HStack spacing={1}>
      <Button
        size={buttonSize}
        minH={buttonMinH}
        px={buttonPx}
        leftIcon={<FiUpload />}
        colorScheme="green"
        variant="outline"
        onClick={onExcelImport}
      >
        엑셀 등록
      </Button>
      <Button
        leftIcon={<FiDownload />}
        size={buttonSize}
        minH={buttonMinH}
        px={buttonPx}
        colorScheme="blue"
        variant="outline"
        onClick={onDownloadAll}
        isLoading={downloading}
        loadingText="다운로드 중"
      >
        전체 직원 목록
      </Button>
    </HStack>
  );
}
