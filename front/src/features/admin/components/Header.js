import { Flex, Box, Button } from "@chakra-ui/react";
import { Alarm } from "../../alarm";
import { useUser } from "../../auth/userContext";
import useAdminLogout from "../hook/useAdminLogout";

export default function Header() {
  const { canLogout, handleLogout } = useAdminLogout();
  const { userName: adminName } = useUser();

  return (
    <Flex
      as="header"
      px="4"
      h="60px"
      flexShrink={0}
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      align="center"
      justify="space-between"
    >
      <Flex align="center" gap={2}>
        <Box fontWeight="bold" fontSize={{ base: "sm", md: "lg" }}>
          {adminName || "Dashboard"}
        </Box>
      </Flex>

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
