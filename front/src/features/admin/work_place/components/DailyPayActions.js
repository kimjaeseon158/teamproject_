import { Button, HStack, Image, Menu, MenuButton, MenuItem, MenuList, Text } from "@chakra-ui/react";
import { ChevronDownIcon, RepeatIcon, SmallAddIcon } from "@chakra-ui/icons";
import excelIcon from "../../../../assets/img/excel.png";

export default function DailyPayActions({ loading, onExcelOpen, onResetSearch }) {
  return (
    <HStack spacing={2} justify={{ base: "flex-start", md: "flex-end" }}>
        <Menu placement="bottom-end">
          <MenuButton
            as={Button}
            rightIcon={<ChevronDownIcon />}
            colorScheme="green"
            size="sm"
            minW="112px"
          >
            <HStack spacing={2} justify="center">
              <Text>Excel</Text>
              <Image src={excelIcon} w="18px" h="18px" alt="excel" />
            </HStack>
          </MenuButton>
          <MenuList minW="250px" p={2} borderColor="gray.200" boxShadow="xl">
            <MenuItem
              icon={<SmallAddIcon />}
              borderRadius="md"
              fontSize="sm"
              fontWeight="700"
              onClick={onExcelOpen}
            >
              일급 엑셀 업로드
            </MenuItem>
          </MenuList>
        </Menu>

        <Button
          leftIcon={<RepeatIcon />}
          variant="outline"
          size="sm"
          onClick={onResetSearch}
          isLoading={loading}
        >
          전체보기
        </Button>
      </HStack>
  );
}
