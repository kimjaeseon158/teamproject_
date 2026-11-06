import { Box, Button } from "@chakra-ui/react";
import { FiDownload } from "react-icons/fi";

export default function ExcelActionMenu({
  display,
  onExport,
}) {
  return (
    <Box display={display} flexShrink={0}>
      <Button
        leftIcon={<FiDownload />}
        bg="green.50"
        color="green.700"
        borderWidth="1px"
        borderColor="green.200"
        _hover={{ bg: "green.100", borderColor: "green.300" }}
        _active={{ bg: "green.200" }}
        size="sm"
        minW="132px"
        onClick={onExport}
      >
        엑셀 다운로드
      </Button>
    </Box>
  );
}
