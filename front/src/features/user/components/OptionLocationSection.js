import {
  Button,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";

export default function OptionLocationSection({ location, locations, onChange }) {
  return (
    <VStack align="stretch" spacing={2}>
      <Text fontSize="xs" fontWeight="bold" color="gray.500" ml={1}>
        업체 및 장소
      </Text>
      <Menu>
        <MenuButton
          as={Button}
          variant="unstyled"
          w="100%"
          h="56px"
          bg="whiteAlpha.100"
          borderRadius="16px"
          px={4}
          textAlign="left"
        >
          <HStack justify="space-between" w="100%">
            <Text color={location ? "white" : "gray.500"} fontSize="md" fontWeight="600" isTruncated>
              {location || "근무 장소를 선택하세요"}
            </Text>
            <ChevronDownIcon color="gray.500" />
          </HStack>
        </MenuButton>
        <MenuList bg="#2c2c2e" borderColor="whiteAlpha.200" color="white" maxH="300px" overflowY="auto" borderRadius="16px">
          {locations.map((loc, index) => (
            <MenuItem key={`${loc}-${index}`} bg="transparent" _hover={{ bg: "whiteAlpha.100" }} onClick={() => onChange(loc)} py={3}>
              {loc}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </VStack>
  );
}
