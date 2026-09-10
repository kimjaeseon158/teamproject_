import { Flex, Box, Button } from "@chakra-ui/react";
import { Alarm } from "../../alarm";
import useAdminLogout from "../hook/useAdminLogout";

export default function Header() {
  const { canLogout, handleLogout } = useAdminLogout();

  return (
    <Flex
      as="header"
      px="4"
      h="60px"
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      align="center"
      justify="space-between"
    >
      <Box display={{ base: "block", md: "block" }} w={{ base: "42px", md: "auto" }} fontWeight="bold" fontSize="lg">
        <Box display={{ base: "none", md: "block" }}>Dashboard</Box>
      </Box>

      <Flex align="center" gap="3">
        <Alarm />
        <Button
          colorScheme="teal"
          size="sm"
          onClick={handleLogout}
          isDisabled={!canLogout}
        >
          Logout
        </Button>
      </Flex>
    </Flex>
  );
}
