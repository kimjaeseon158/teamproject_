import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Box, Button, HStack, Icon, Menu, MenuButton, MenuItem,
  MenuList, Text,
} from "@chakra-ui/react";
import { FiDownload, FiUpload } from "react-icons/fi";

export default function ExcelActionMenu({
  display,
  onExport,
  onImport,
}) {
  return (
    <Box display={display} flexShrink={0}>
      <Menu placement="bottom-end">
        <MenuButton
          as={Button}
          leftIcon={<FiDownload />}
          rightIcon={<ChevronDownIcon />}
          bg="green.50"
          color="green.700"
          borderWidth="1px"
          borderColor="green.200"
          _hover={{ bg: "green.100", borderColor: "green.300" }}
          _active={{ bg: "green.200" }}
          size="sm"
          minW="132px"
        >
          엑셀 다운로드
        </MenuButton>
        <MenuList minW="250px" p={2} borderRadius="lg" boxShadow="lg">
          <MenuItem
            borderRadius="md"
            py={3}
            isDisabled={!onImport}
            onClick={onImport}
          >
            <HStack align="flex-start" spacing={3}>
              <Icon as={FiUpload} mt={1} color="green.600" />
              <Box>
                <Text fontSize="sm" fontWeight="700">엑셀 가져오기</Text>
                <Text fontSize="xs" color="gray.500">작성한 템플릿 파일 등록</Text>
              </Box>
            </HStack>
          </MenuItem>
          <MenuItem borderRadius="md" py={3} onClick={onExport}>
            <HStack align="flex-start" spacing={3}>
              <Icon as={FiDownload} mt={1} color="green.600" />
              <Box>
                <Text fontSize="sm" fontWeight="700">엑셀 내보내기</Text>
                <Text fontSize="xs" color="gray.500">선택한 데이터를 템플릿으로 저장</Text>
              </Box>
            </HStack>
          </MenuItem>
        </MenuList>
      </Menu>
    </Box>
  );
}
