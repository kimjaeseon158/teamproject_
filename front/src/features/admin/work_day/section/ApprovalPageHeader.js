import { Badge, Box, Button, Flex, Heading, HStack, Image, Text, Tooltip } from "@chakra-ui/react";
import { DownloadIcon } from "@chakra-ui/icons";

import excelIcon from "../../../../assets/img/excel.png";

export default function ApprovalPageHeader({ loading, totalCount, onExcelOpen }) {
  return (
    <Flex justify="space-between" align="center" direction="row" gap={2} mb={5}>
      <Box>
      </Box>

      <HStack display={{ base: "none", md: "flex" }} spacing={2} justify={{ base: "flex-start", md: "flex-end" }}>
        <Tooltip label="승인관리 문서 생성" hasArrow>
          <Button
            leftIcon={<DownloadIcon />}
            rightIcon={<Image src={excelIcon} w="22px" h="22px" alt="excel" />}
            colorScheme="green"
            variant="outline"
            size="sm"
            minW="92px"
            onClick={onExcelOpen}
          >
            Excel
          </Button>
        </Tooltip>
      </HStack>
    </Flex>
  );
}
