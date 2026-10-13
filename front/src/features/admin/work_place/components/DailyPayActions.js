import { Button, HStack, Image, Tooltip } from "@chakra-ui/react";
import { DownloadIcon, RepeatIcon } from "@chakra-ui/icons";
import excelIcon from "../../../../assets/img/excel.png";

export default function DailyPayActions({ loading, onExcelOpen, onResetSearch }) {
  return (
    <HStack spacing={2} justify={{ base: "flex-start", md: "flex-end" }}>
        <Tooltip label="일급관리 문서 생성" hasArrow>
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

        <Button
          leftIcon={<RepeatIcon />}
          variant="outline"
          size="sm"
          onClick={onResetSearch}
          isLoading={loading}
        >
          초기화
        </Button>
      </HStack>
  );
}
