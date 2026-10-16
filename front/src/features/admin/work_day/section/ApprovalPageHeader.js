import { Button, Tooltip } from "@chakra-ui/react";
import { DownloadIcon } from "@chakra-ui/icons";


export default function ApprovalPageHeader({ onExcelOpen }) {
  return (
    <Tooltip label="승인관리 문서 생성" hasArrow>
      <Button
        display={{ base: "none", md: "inline-flex" }}
        leftIcon={<DownloadIcon />}
        bg="green.50"
        color="green.700"
        borderWidth="1px"
        borderColor="green.200"
        _hover={{ bg: "green.100", borderColor: "green.300" }}
        _active={{ bg: "green.200" }}
        size="sm"
        minW="118px"
        onClick={onExcelOpen}
      >
        엑셀 다운로드
      </Button>
    </Tooltip>
  );
}
